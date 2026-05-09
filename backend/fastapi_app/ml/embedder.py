"""
Embedder module - singleton model loader for sentence-transformers.
Ensures model is loaded only once per process.
"""
from typing import List, Optional
from sentence_transformers import SentenceTransformer
import numpy as np
from ai.src.logger.logging import get_logger

logger = get_logger(__name__)


class EmbedderSingleton:
    """Singleton for managing sentence-transformers model."""
    
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbedderSingleton, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize (no-op if already initialized)."""
        pass

    @staticmethod
    def _normalize_text_input(text: str | List[str]) -> str | List[str]:
        """
        Normalize text before encoding.
        SentenceTransformer handles real text much more reliably than empty values.
        """
        if isinstance(text, str):
            stripped = text.strip()
            return stripped if stripped else " "

        normalized = []
        for item in text:
            stripped = str(item).strip()
            normalized.append(stripped if stripped else " ")
        return normalized
    
    def load(self, model_name: str = "all-MiniLM-L6-v2") -> SentenceTransformer:
        """
        Load sentence-transformer model (lazy loading).
        
        Args:
            model_name: model name from Hugging Face hub
            
        Returns:
            SentenceTransformer model instance
        """
        if self._model is None:
            logger.info(f"Loading embedding model: {model_name}")
            try:
                self._model = SentenceTransformer(model_name)
                logger.info(f"Model loaded successfully. Dimension: {self._model.get_sentence_embedding_dimension()}")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                raise
        
        return self._model
    
    def get(self) -> Optional[SentenceTransformer]:
        """Get loaded model or None."""
        return self._model
    
    def embed(self, text: str | List[str], show_progress_bar: bool = False) -> np.ndarray:
        """
        Embed text(s) using loaded model.
        
        Args:
            text: single text or list of texts
            show_progress_bar: whether to show progress bar
            
        Returns:
            embedding vector(s) as numpy array
        """
        if self._model is None:
            self.load()
        
        try:
            normalized_text = self._normalize_text_input(text)
            
            if not normalized_text:
                logger.warning("Normalized text is empty, returning zero vector")
                return np.zeros((1, self.get_dimension())) if isinstance(text, str) else np.zeros((0, self.get_dimension()))
            
            model_device = getattr(self._model, "device", None)
            device_str = str(model_device) if model_device is not None else "cpu"

            embeddings = self._model.encode(
                normalized_text,
                show_progress_bar=show_progress_bar,
                convert_to_numpy=True,
                device=device_str
            )
            
            # Ensure embeddings is a numpy array
            if not isinstance(embeddings, np.ndarray):
                logger.warning(f"Embeddings returned as {type(embeddings)}, converting to numpy array")
                embeddings = np.asarray(embeddings)
            
            return embeddings
        except Exception as e:
            logger.error(f"Error encoding text: {e}")
            # Return zero vector as fallback
            dim = self.get_dimension() if self._model else 384
            if isinstance(text, str):
                return np.zeros((1, dim))
            else:
                return np.zeros((len(text), dim))
    
    def get_dimension(self) -> int:
        """Get embedding dimension."""
        if self._model is None:
            self.load()
        
        return self._model.get_sentence_embedding_dimension()


# Global singleton instance
_embedder_singleton = EmbedderSingleton()


def get_embedder() -> EmbedderSingleton:
    """Get or create embedder singleton."""
    return _embedder_singleton


def embed(text: str | List[str]) -> np.ndarray:
    """
    Embed text using global embedder.
    Convenience function.
    
    Args:
        text: text or list of texts to embed
        
    Returns:
        embedding vector(s)
    """
    return get_embedder().embed(text)
