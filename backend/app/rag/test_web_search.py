from app.rag.web_search import search_web


question = "latest livestock disease alerts in India"

print("=" * 50)
print("TESTING WEB SEARCH")
print("=" * 50)

results = search_web(question, max_results=3)

print(f"\nResults found: {len(results)}\n")

for i, result in enumerate(results, 1):
    print(f"--- Result {i} ---")
    print("Title:", result["title"])
    print("URL:", result["url"])
    print("Content:", result["content"][:500])
    print()