from logger import setup_logger
logger = setup_logger()

class User:
    def __init__(self, user_data):
        logger.info(f"User data: {user_data}")
        
        # Handle both dictionary and Telegram User object
        if hasattr(user_data, 'id'):  # Telegram User object
            self.id = user_data.id
            self.first_name = user_data.first_name
            self.last_name = getattr(user_data, 'last_name', None)
            self.username = getattr(user_data, 'username', None)
        else:  # Dictionary
            self.id = user_data.get('id')
            self.first_name = user_data.get('first_name')
            self.last_name = user_data.get('last_name')
            self.username = user_data.get('username')
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'username': self.username
        }