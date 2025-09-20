import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import uuid
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Система реального игрового лобби 5 на 5
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с данными лобби
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Подключение к БД
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            # Получить состояние лобби
            cur.execute("""
                SELECT p.*, t.name as team_name, t.color as team_color 
                FROM players p 
                LEFT JOIN teams t ON p.team_id = t.id 
                ORDER BY p.joined_at
            """)
            players = [dict(row) for row in cur.fetchall()]
            
            cur.execute("SELECT * FROM lobby_state ORDER BY id DESC LIMIT 1")
            lobby = dict(cur.fetchone()) if cur.rowcount > 0 else {}
            
            cur.execute("""
                SELECT * FROM chat_messages 
                ORDER BY created_at DESC LIMIT 50
            """)
            messages = [dict(row) for row in cur.fetchall()]
            messages.reverse()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'players': players,
                    'lobby': lobby,
                    'messages': messages
                }, default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'join':
                username = body_data.get('username', f'Player_{uuid.uuid4().hex[:6]}')
                session_id = str(uuid.uuid4())
                
                # Проверяем, не превышен ли лимит игроков
                cur.execute("SELECT COUNT(*) as count FROM players WHERE status = 'online'")
                player_count = cur.fetchone()['count']
                
                if player_count >= 10:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Лобби заполнено (максимум 10 игроков)'})
                    }
                
                # Удаляем старые записи игрока если есть
                cur.execute("DELETE FROM players WHERE username = %s", (username,))
                
                # Добавляем игрока
                cur.execute("""
                    INSERT INTO players (username, session_id, status, level, avatar_emoji) 
                    VALUES (%s, %s, 'online', %s, %s)
                    RETURNING *
                """, (
                    username, 
                    session_id, 
                    body_data.get('level', 1),
                    body_data.get('avatar', '🎮')
                ))
                
                new_player = dict(cur.fetchone())
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'player': new_player,
                        'session_id': session_id
                    }, default=str)
                }
            
            elif action == 'assign_team':
                player_id = body_data.get('player_id')
                team_id = body_data.get('team_id')
                
                cur.execute("""
                    UPDATE players SET team_id = %s 
                    WHERE id = %s AND status = 'online'
                """, (team_id, player_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'send_message':
                username = body_data.get('username')
                message = body_data.get('message')
                
                if username and message:
                    cur.execute("""
                        INSERT INTO chat_messages (username, message) 
                        VALUES (%s, %s)
                        RETURNING *
                    """, (username, message))
                    
                    new_message = dict(cur.fetchone())
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': True,
                            'message': new_message
                        }, default=str)
                    }
        
        elif method == 'DELETE':
            # Покинуть лобби
            session_id = event.get('headers', {}).get('x-session-id') or event.get('headers', {}).get('X-Session-ID')
            
            if session_id:
                cur.execute("DELETE FROM players WHERE session_id = %s", (session_id,))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        if 'conn' in locals():
            conn.close()