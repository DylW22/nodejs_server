import requests
import time
import json
import re
from datetime import datetime
# Base URL for your API
BASE_URL = "http://127.0.0.1:3000/"  # Change the port as needed
#BASE_URL = "https://nodejs-server-neon-iota.vercel.app"


def ping_server():
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200

def test_get_posts():
    test_name = test_get_posts.__name__
    print(f"#### Starting {test_name} ####")
    response = requests.get(f"{BASE_URL}/posts")
    assert response.status_code == 200
    result = "GET /posts response:", response.json()

    
    #test_results.append({"testName": test_name, "status" :"passed", "result": result})
    print(f"#### {test_name} finished ####")

runs = 20
execution_times = []
for i in range(0,runs):
    start_time = time.perf_counter()

    #response = requests.get(f"{BASE_URL}/posts")
    #test_get_posts()
    ping_server()
    #result = "GET /posts response:", response.json()
    
    elapsed_time = time.perf_counter() - start_time
    execution_times.append(elapsed_time)
    time.sleep(0.1)
    print(f"Elapsed time: {elapsed_time:.2f} seconds")

average = sum(execution_times) / len(execution_times)
maxTime = max(execution_times)
minTime = min(execution_times)
print(f"Average time: {average:.2f} seconds")
print(f"Max time: {maxTime:.2f} seconds")
print(f"Min time: {minTime:.2f} seconds")