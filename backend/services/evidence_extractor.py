"""Extract evidence from web sources."""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import re
from urllib.parse import urljoin, urlparse
import time


class EvidenceExtractor:
    """Extract evidence from web pages and search results."""

    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    @staticmethod
    def fetch_url(url: str, timeout: int = 10) -> Optional[BeautifulSoup]:
        """Fetch and parse a URL."""
        try:
            response = requests.get(url, headers=EvidenceExtractor.HEADERS, timeout=timeout)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    @staticmethod
    def extract_text_from_html(soup: BeautifulSoup) -> str:
        """Extract main text content from HTML."""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "header", "footer"]):
            script.decompose()
        
        # Try to find main content areas
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile('content|main|article'))
        
        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
        else:
            text = soup.get_text(separator=' ', strip=True)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    @staticmethod
    def extract_evidence_from_url(url: str, max_length: int = 2000) -> Optional[Dict[str, str]]:
        """
        Extract evidence text from a URL.
        
        Returns:
            Dictionary with 'text', 'title', and 'url'
        """
        soup = EvidenceExtractor.fetch_url(url)
        if not soup:
            return None
        
        # Extract title
        title = None
        if soup.title:
            title = soup.title.string.strip()
        else:
            og_title = soup.find('meta', property='og:title')
            if og_title:
                title = og_title.get('content', '').strip()
        
        # Extract text
        text = EvidenceExtractor.extract_text_from_html(soup)
        
        # Limit text length
        if len(text) > max_length:
            text = text[:max_length] + "..."
        
        return {
            "text": text,
            "title": title or "Untitled",
            "url": url
        }

    @staticmethod
    def search_web(query: str, max_results: int = 10) -> List[Dict[str, str]]:
        """
        Search the web for evidence related to a query.
        
        This is a basic implementation. In production, you'd use:
        - Google Custom Search API
        - SerpAPI
        - DuckDuckGo API
        - etc.
        
        For now, returns empty list - user should provide URLs manually
        or integrate a search API.
        """
        # Placeholder for search API integration
        # Example with Google Custom Search API:
        # if SEARCH_API_KEY and SEARCH_ENGINE_ID:
        #     url = f"https://www.googleapis.com/customsearch/v1"
        #     params = {
        #         "key": SEARCH_API_KEY,
        #         "cx": SEARCH_ENGINE_ID,
        #         "q": query,
        #         "num": max_results
        #     }
        #     response = requests.get(url, params=params)
        #     results = response.json().get("items", [])
        #     return [{"url": item["link"], "title": item["title"]} for item in results]
        
        return []

    @staticmethod
    def extract_evidence_from_urls(urls: List[str]) -> List[Dict[str, str]]:
        """Extract evidence from multiple URLs."""
        results = []
        for url in urls:
            evidence = EvidenceExtractor.extract_evidence_from_url(url)
            if evidence:
                results.append(evidence)
            time.sleep(0.5)  # Be respectful with rate limiting
        return results

