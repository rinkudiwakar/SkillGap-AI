"""
Resume parser service - extracts text and structure from PDF resumes.
"""
from typing import Optional, Dict, Any
import pdfplumber
from src.logger.logging import get_logger

logger = get_logger(__name__)


class ResumeParser:
    """Parse resume PDF files."""
    
    @staticmethod
    def extract_text(pdf_path: str) -> str:
        """
        Extract all text from PDF resume.
        
        Args:
            pdf_path: path to PDF file
            
        Returns:
            combined text from all pages
            
        Raises:
            FileNotFoundError: if PDF not found
            Exception: if PDF parsing fails
        """
        text = ""
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                logger.info(f"Opening PDF: {pdf_path}, Pages: {len(pdf.pages)}")
                
                for page_num, page in enumerate(pdf.pages, 1):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                        else:
                            logger.warning(f"Page {page_num} returned empty text")
                    except Exception as e:
                        logger.warning(f"Error extracting text from page {page_num}: {e}")
                        continue
            
            if not text.strip():
                logger.warning("No text extracted from PDF")
                return ""
            
            logger.info(f"Successfully extracted {len(text)} characters from resume")
            return text.strip()
        
        except FileNotFoundError:
            logger.error(f"Resume file not found: {pdf_path}")
            raise
        except Exception as e:
            logger.error(f"Error parsing resume PDF: {e}")
            raise
    
    @staticmethod
    def get_confidence_score(text: str) -> float:
        """
        Estimate text extraction confidence.
        Simple heuristic: length and structure indicators.
        
        Args:
            text: extracted text
            
        Returns:
            confidence score 0-1
        """
        if not text:
            return 0.0
        
        # Heuristics
        lines = text.split('\n')
        avg_line_length = len(text) / len(lines) if lines else 0
        
        # Good resume usually has:
        # - decent total length (>500 chars)
        # - reasonable line length (20-150 chars)
        # - multiple lines (>10)
        
        length_score = min(1.0, len(text) / 5000)  # expect 5000+ chars
        line_score = min(1.0, len(lines) / 20)      # expect 20+ lines
        avg_length_score = 1.0 if 20 <= avg_line_length <= 150 else 0.5
        
        confidence = (length_score * 0.4 + line_score * 0.35 + avg_length_score * 0.25)
        return confidence


class PDFResumePipeline:
    """Full resume PDF processing pipeline."""
    
    def __init__(self, extract_sections: bool = True):
        """
        Initialize resume pipeline.
        
        Args:
            extract_sections: whether to extract resume sections
        """
        self.parser = ResumeParser()
        self.extract_sections = extract_sections
    
    def process(self, pdf_path: str, min_confidence: float = 0.5) -> Dict[str, Any]:
        """
        Process resume PDF and return extracted data.
        
        Args:
            pdf_path: path to PDF file
            min_confidence: minimum confidence threshold
            
        Returns:
            dict with extracted data:
            {
                'text': str,
                'confidence': float,
                'sections': dict (if extract_sections=True),
                'error': None or str
            }
        """
        try:
            text = self.parser.extract_text(pdf_path)
            confidence = self.parser.get_confidence_score(text)
            
            if confidence < min_confidence:
                logger.warning(f"Low confidence extraction: {confidence:.2f}")
            
            result = {
                'text': text,
                'confidence': confidence,
                'error': None
            }
            
            if self.extract_sections:
                result['sections'] = self._extract_sections(text)
            
            return result
        
        except Exception as e:
            logger.error(f"Resume processing failed: {e}")
            return {
                'text': '',
                'confidence': 0.0,
                'error': str(e),
                'sections': {}
            }
    
    @staticmethod
    def _extract_sections(text: str) -> Dict[str, str]:
        """
        Extract resume sections from text.
        Simple heuristic-based section detection.
        
        Args:
            text: full resume text
            
        Returns:
            dict with sections: skills, experience, education, projects, summary
        """
        sections = {
            'skills': '',
            'experience': '',
            'education': '',
            'projects': '',
            'summary': ''
        }
        
        lines = text.split('\n')
        current_section = 'summary'
        
        section_keywords = {
            'skills': ['skill', 'technical skill', 'competency', 'expertise'],
            'experience': ['experience', 'employment', 'work history', 'professional', 'career'],
            'education': ['education', 'academic', 'degree', 'university', 'college', 'school'],
            'projects': ['project', 'portfolio', 'achievement']
        }
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Detect section headers
            for section_name, keywords in section_keywords.items():
                if any(kw in line_lower for kw in keywords):
                    current_section = section_name
                    break
            
            # Add line to current section
            if line.strip():
                sections[current_section] += line + "\n"
        
        return {k: v.strip() for k, v in sections.items()}


def extract_resume_text(pdf_path: str) -> str:
    """Convenience function to extract resume text."""
    parser = ResumeParser()
    return parser.extract_text(pdf_path)


def process_resume_pdf(pdf_path: str) -> Dict[str, Any]:
    """Convenience function for full pipeline."""
    pipeline = PDFResumePipeline(extract_sections=True)
    return pipeline.process(pdf_path)
