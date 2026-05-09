"""
Logging configuration for SkillGap AI.
Provides JSON and human-readable logging to file and console.
"""
import logging
import os
import sys
import json
from logging.handlers import RotatingFileHandler
from datetime import datetime
from pathlib import Path

# Logging constants
LOG_DIR = 'logs'
LOG_FILE_PREFIX = "skillgap_ai"
MAX_LOG_SIZE = 5 * 1024 * 1024  # 5 MB
BACKUP_COUNT = 10

# Get root directory and ensure logs directory exists
ROOT_DIR = Path(__file__).parent.parent.parent
LOG_DIR_PATH = ROOT_DIR / LOG_DIR
LOG_DIR_PATH.mkdir(exist_ok=True, parents=True)

# Current log file
LOG_FILE_PATH = LOG_DIR_PATH / f"{LOG_FILE_PREFIX}_{datetime.now().strftime('%Y%m%d')}.log"


class JSONFormatter(logging.Formatter):
    """Custom formatter that outputs JSON."""
    
    def format(self, record):
        """Format log record as JSON."""
        log_obj = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        if record.exc_info:
            log_obj['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_obj, default=str)


class ColoredFormatter(logging.Formatter):
    """Custom formatter with color support for console."""
    
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }
    
    def format(self, record):
        """Format log record with colors."""
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']
        
        formatted = super().format(record)
        return f"{color}{formatted}{reset}"


_configured = False
_logger = None


def configure_logging(log_level: str = "INFO") -> None:
    """
    Configure logging for the application.
    
    Args:
        log_level: logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    global _configured, _logger
    
    if _configured:
        return
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # File handler with rotation (JSON format)
    file_handler = RotatingFileHandler(
        LOG_FILE_PATH,
        maxBytes=MAX_LOG_SIZE,
        backupCount=BACKUP_COUNT
    )
    file_handler.setLevel(logging.INFO)
    file_formatter = JSONFormatter()
    file_handler.setFormatter(file_formatter)
    root_logger.addHandler(file_handler)
    
    # Console handler (colored human-readable format)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = ColoredFormatter(
        "[%(asctime)s] %(name)s - %(levelname)s - %(message)s"
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    _configured = True


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance.
    
    Args:
        name: logger name (typically __name__)
        
    Returns:
        configured logger instance
    """
    if not _configured:
        configure_logging()
    
    return logging.getLogger(name)


# Configure on import
configure_logging()