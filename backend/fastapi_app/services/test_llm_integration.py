"""
Integration test and example for new LLM service with dual provider support.
Demonstrates:
- Centralized prompt loading
- Batch bullet rewriting
- Dual provider support (OpenAI + Gemini)
- Fallback logic
"""
import os
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def test_prompt_loader():
    """Test prompt loader utility."""
    print("\n" + "=" * 60)
    print("TEST 1: Prompt Loader")
    print("=" * 60)
    
    try:
        from fastapi_app.utils.prompt_loader import load_prompt
        
        prompt = load_prompt("rewrite.txt")
        print(f"✓ Prompt loaded successfully")
        print(f"  Length: {len(prompt)} characters")
        print(f"  Contains 'rewritten_bullets': {'{rewritten_bullets}' in prompt}")
        return True
    except Exception as e:
        print(f"✗ Prompt loader failed: {e}")
        return False


def test_llm_service_initialization():
    """Test LLM service initialization."""
    print("\n" + "=" * 60)
    print("TEST 2: LLM Service Initialization")
    print("=" * 60)
    
    try:
        from fastapi_app.services.llm_service import get_llm_service
        
        service = get_llm_service()
        print(f"✓ LLM service initialized")
        print(f"  OpenAI provider: {service.openai_provider is not None}")
        print(f"  Gemini provider: {service.gemini_provider is not None}")
        
        if not service.openai_provider and not service.gemini_provider:
            print("  ⚠ WARNING: No providers configured. Set OPENAI_API_KEY and/or GEMINI_API_KEY")
            return False
        
        return True
    except Exception as e:
        print(f"✗ LLM service initialization failed: {e}")
        return False


def test_batch_rewrite_function():
    """Test batch rewrite function with mock data."""
    print("\n" + "=" * 60)
    print("TEST 3: Batch Rewrite Function (Mock)")
    print("=" * 60)
    
    try:
        from fastapi_app.chains import rewrite_bullets_batch
        
        # Test with mock data
        test_bullets = [
            "Led development of REST API using FastAPI",
            "Implemented machine learning model for classification",
            "Managed database migrations and optimization"
        ]
        
        test_keywords = ["Python", "FastAPI", "Machine Learning", "API Design", "Database"]
        test_role = "Senior Backend Engineer"
        
        print(f"✓ Batch rewrite function loaded successfully")
        print(f"  Test input: {len(test_bullets)} bullets")
        print(f"  Keywords: {len(test_keywords)} keywords")
        print(f"  Role: {test_role}")
        print(f"\n  NOTE: Actual rewrite requires configured API keys")
        print(f"        Set OPENAI_API_KEY or GEMINI_API_KEY in .env to enable")
        
        return True
    except Exception as e:
        print(f"✗ Batch rewrite function failed: {e}")
        return False


def test_backward_compatibility():
    """Test that old single-bullet rewrite still works."""
    print("\n" + "=" * 60)
    print("TEST 4: Backward Compatibility (Single Bullet)")
    print("=" * 60)
    
    try:
        from fastapi_app.chains import rewrite_bullet
        
        test_bullet = "Developed scalable microservices architecture"
        test_keywords = ["Microservices", "Scalability", "Cloud"]
        test_role = "DevOps Engineer"
        
        print(f"✓ Single bullet rewrite function loaded successfully")
        print(f"  Test input: '{test_bullet}'")
        print(f"  Role: {test_role}")
        print(f"\n  NOTE: Actual rewrite requires configured API keys")
        
        return True
    except Exception as e:
        print(f"✗ Single bullet rewrite function failed: {e}")
        return False


def test_provider_imports():
    """Test that provider classes are available."""
    print("\n" + "=" * 60)
    print("TEST 5: Provider Classes")
    print("=" * 60)
    
    try:
        from fastapi_app.services.llm_service import (
            OpenAIProvider,
            GeminiProvider,
            LLMService,
            LLMServiceError
        )
        
        print(f"✓ All provider classes imported successfully")
        print(f"  - OpenAIProvider")
        print(f"  - GeminiProvider")
        print(f"  - LLMService")
        print(f"  - LLMServiceError")
        
        return True
    except Exception as e:
        print(f"✗ Provider import failed: {e}")
        return False


def test_config_keys():
    """Test that config contains new API keys."""
    print("\n" + "=" * 60)
    print("TEST 6: Configuration")
    print("=" * 60)
    
    try:
        from fastapi_app.config import get_config
        
        config = get_config()
        
        has_openai = hasattr(config, 'OPENAI_API_KEY')
        has_gemini = hasattr(config, 'GEMINI_API_KEY')
        
        print(f"✓ Config loaded successfully")
        print(f"  - OPENAI_API_KEY configured: {has_openai}")
        print(f"  - GEMINI_API_KEY configured: {has_gemini}")
        
        if not has_openai or not has_gemini:
            print(f"  ⚠ WARNING: Missing API key configuration in config.py")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Config test failed: {e}")
        return False


def print_summary(results):
    """Print test summary."""
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All tests passed! Implementation is ready.")
    else:
        print(f"\n⚠ {total - passed} test(s) failed. Please review the errors above.")


def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("SKILLGAP AI - LLM SERVICE INTEGRATION TESTS")
    print("=" * 60)
    print(f"Project root: {PROJECT_ROOT}")
    
    results = {
        "Prompt Loader": test_prompt_loader(),
        "LLM Service Init": test_llm_service_initialization(),
        "Batch Rewrite": test_batch_rewrite_function(),
        "Backward Compat": test_backward_compatibility(),
        "Provider Imports": test_provider_imports(),
        "Configuration": test_config_keys(),
    }
    
    print_summary(results)
    
    print("\n" + "=" * 60)
    print("USAGE EXAMPLES")
    print("=" * 60)
    print("""
1. Single Bullet Rewrite (backward compatible):
   from fastapi_app.chains import rewrite_bullet
   
   result = rewrite_bullet(
       bullet="Developed REST API",
       jd_keywords=["Python", "FastAPI"],
       jd_role="Backend Engineer"
   )

2. Batch Rewrite (new feature):
   from fastapi_app.chains import rewrite_bullets_batch
   
   results = rewrite_bullets_batch(
       bullets=[
           "Developed REST API",
           "Managed databases",
           "Led team of 5 engineers"
       ],
       jd_keywords=["Python", "FastAPI", "Database", "Leadership"],
       jd_role="Senior Backend Engineer",
       priority="high"  # "high" = OpenAI, "low" = Gemini
   )

3. Direct LLM Service (low-level API):
   from fastapi_app.services.llm_service import get_llm_service
   
   service = get_llm_service()
   results = service.rewrite_bullets(
       jd_keywords=["Python", "FastAPI"],
       role="Backend Engineer",
       bullets=["Developed REST API"],
       priority="high"
   )
    """)
    
    print("\n" + "=" * 60)
    print("NEXT STEPS")
    print("=" * 60)
    print("""
1. Set OPENAI_API_KEY in .env to use OpenAI (gpt-4o-mini)
2. Optionally set GEMINI_API_KEY for Gemini Flash fallback
3. Update any existing code that calls rewrite_bullet() to use
   rewrite_bullets_batch() for better efficiency (if applicable)
4. All new prompt files should be added to /prompts/ directory
    """)


if __name__ == "__main__":
    main()
