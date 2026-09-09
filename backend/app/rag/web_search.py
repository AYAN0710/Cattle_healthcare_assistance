from ddgs import DDGS

def search_web(question:str,max_results:int=3):
    results=[]
    try:
        with DDGS() as ddgs:
            search_results=ddgs.text(question,max_results=max_results)
            for result in search_results:
                results.append({
                    'title':result.get('title',''),
                    'url':result.get('href',''),
                    'content':result.get('body','')
                })
    except Exception as e:
        print(f'Web Search failed: {e}')
    return results