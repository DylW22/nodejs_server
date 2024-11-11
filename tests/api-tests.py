import requests
import time
import json
import re
from datetime import datetime
# Base URL for your API
#BASE_URL = "http://127.0.0.1:3000/"  # Change the port as needed
BASE_URL = "https://nodejs-server-neon-iota.vercel.app"
GREEN = "\033[92m"
RED = "\033[91m" 
RESET = "\033[0m"


test_results = []
# Function to test GET request
def test_get_posts():
    test_name = test_get_posts.__name__
    print(f"#### Starting {test_name} ####")
    response = requests.get(f"{BASE_URL}/posts")
    assert response.status_code == 200
    result = "GET /posts response:", response.json()

    
    test_results.append({"testName": test_name, "status" :"passed", "result": result})
    print(f"#### {test_name} finished ####")
# Function to test POST request [/login]
def test_login(testself=False):
    if(testself):
        test_name = test_login.__name__
        print(f"#### Starting {test_name} ####")
    data = {
        "username": "username",
        "password" : "password"
    }
    response = requests.post(f"{BASE_URL}/login", json=data)
    assert response.status_code == 200
    if(testself):
        result = "POST /login response: ", response.json()
        test_results.append({"testName": test_name, "status" :"passed", "result": result})
        print(f"#### {test_name} finished ####")
    return response.json().get('token')

# Function to test POST request [/logout]
def test_logout(testself=False):
    test_name = test_logout.__name__
    if(testself):
        print(f"#### Starting {test_name} ####")
    token = test_login()
    data = {}
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.post(f"{BASE_URL}/logout", headers=headers, json=data)
    
    assert response.status_code == 200

    time.sleep(2)
    if(testself):
        result = "POST /logout response: ", response.json()
        test_results.append({"testName": test_name, "status" :"passed", "result" : result})
        print(f"#### {test_name} finished ####")
# Function to test POST request
def test_create_post():
    test_name = test_create_post.__name__
    print(f"#### Starting {test_name} ####")
    try:
        token = test_login()
        
        headers = {
            "Authorization": f"Bearer {token}"
        }

        data = {
            "title": "New Post",
            "content": "This is a new post."
        }
        response = requests.post(f"{BASE_URL}/posts", json=data,  headers=headers)

        assert response.status_code == 201
        result = "POST /posts response:", response.json()
        test_results.append({"testName": test_name, "status" :"passed", "result" : result})
        test_logout() # Added 11.04
    except Exception as e:
        result = f"POST /posts failed: {e}"
        test_results.append({"testName": test_name, "status" :"failed", "result" : result})
    print(f"#### {test_name} finished ####")
# Function to test a specific GET request
def test_get_post_by_id(post_id):
    test_name = test_get_post_by_id.__name__
    print(f"#### Starting {test_name} ####")
    try:
        response = requests.get(f"{BASE_URL}/posts/{post_id}")
        if response.status_code == 200:
            result = "GET /posts/{post_id} response:", response.json()
            test_results.append({"testName": test_name, "status" :"passed", "result": result})
        else:
            result = "Post not found. Status code:", response.status_code
            test_results.append({"testName": test_name, "status" :"failed", "result": result})
            
        test_logout() # Added 11.04
    except Exception as e:
        result = f"GET /posts/{post_id} failed: {e}"
        test_results.append({"testName": test_name, "status" :"failed", "result": result})
    print(f"#### {test_name} finished ####")
# Function to test PUT request
def test_update_post(post_id):
    test_name = test_update_post.__name__
    print(f"#### Starting {test_name} ####")
    try:
        token = test_login()
        headers = {
            "Authorization": f"Bearer {token}"
        }
        data = {
            "title": "Updated Post",
            "content": "This is an updated post."
        }
        response = requests.put(f"{BASE_URL}/posts/{post_id}", json=data, headers=headers)
        assert response.status_code == 200
        result = "PUT /posts/{post_id} response:", response.json()
        test_results.append({"testName": test_name, "status" :"passed", "result" : result})
        test_logout() # Added 11.04
    except Exception as e:
        result = f"PUT /posts/{post_id} failed: {e}"
        test_results.append({"testName": test_name, "status" :"failed", "result" : result})
    print(f"#### {test_name} finished ####")
# Function to test DELETE request
def test_delete_post(post_id):
    test_name = test_delete_post.__name__
    print(f"#### Starting {test_name} ####")
    try:
        token = test_login()
        headers = {
            "Authorization" : f"Bearer {token}"
        }
        response = requests.delete(f"{BASE_URL}/posts/{post_id}", headers=headers)
        assert response.status_code == 204
        result = "DELETE /posts/{post_id} response: Deleted successfully."
        test_results.append({"testName": test_name, "status" :"passed", "result": result})
        
    except Exception as e:
        result = f"DELETE /posts/{post_id} failed: {e}"
        test_results.append({"testName": test_name, "status": "failed", "result": result})
    print(f"#### {test_name} finished ####")

def test_rate_limit(limit):
    test_name = test_rate_limit.__name__
    print(f"#### Starting {test_name} ####")
    try:
        count = 0
        while count < limit:
            response = requests.get(f"{BASE_URL}/posts")
            count += 1
            if response.status_code == 429:  # 429 indicates rate limit exceeded
                #print(f"Rate limit reached on request {count}")
                test_results.append({"testName": test_name, "status" :"passed", "result": response.status_code})
                break
            #print(f"Request {count}: Status Code {response.status_code}")

        # If we made all requests without hitting rate limit, assert failure
        assert response.status_code != 429, "Rate limit was not enforced as expected."
        test_results.append({"testName": test_name, "status" :"failed", "result": response.status_code})
    except Exception as e:
        print(f"An error occurred: {e}")
        raise  # Raise the exception to allow for further handling (like in test cases)
    print(f"#### {test_name} finished ####")
# Run tests


# Where t is in seconds
def waitTime(t):
    time.sleep(t)
test_post_id = "15"
if __name__ == "__main__":
    test_get_posts()
    test_login(True)
    test_logout(True)
    waitTime(60)
    test_create_post()
    waitTime(60)
    test_get_post_by_id(test_post_id)  
    test_update_post(test_post_id)  
    test_delete_post(test_post_id)
    # test_rate_limit(11)

def remove_ansi_escape_codes(text):
   
    ansi_escape = re.compile(r'\x1B\[[0-?9;]*[mK]')
    return ansi_escape.sub('', text)

def format_string(color, result):
    if isinstance(result, (int, float)):
        return f"{color}{result:.2f}{RESET}"
    else:
        return f"{color}{result}{RESET}"

def print_test_results():

    file_path = 'tests/results/'
    now = datetime.now()
    timestamp = now.strftime("%d%m%Y_%H%M%S")
    file_name = f'test_results_{timestamp}.txt'
    with open(file_path + file_name, 'w') as file:

        def output(line, is_file=True):
            print(line)
            if is_file:
               # line = ''.join(filter(lambda x: x.isprintable(), line)) 
                line = remove_ansi_escape_codes(line)
            file.write(line.replace("\n", "") + "\n")

        output("\n###################################################")

        
     
        current_time = now.strftime("%I:%M%p, %d.%m.%y").lstrip("0").replace(" 0", " ")
        output(f"Time: {current_time} \n")

        output("Results summary: \n")
        
        success_count = sum(1 for test in test_results if test['status'] == 'passed')
        total_tests = len(test_results)

        for obj in test_results:
        
            output(f"{obj['testName']}, status: {obj['status']}, result: {obj['result']}")
        
        output("\n")
    
        success_rate = (success_count / total_tests) * 100 if total_tests > 0 else 0

        color = GREEN if success_rate == 100 else RED
        output(f"Tests passed: {format_string(color, f'{success_count}/{total_tests}')}")
        output(f"Success rate: {format_string(color, f'{success_rate:.2f}%')}")

        
        output("##################################################")


        json.dump(test_results, file, indent=4)
        file.write("##################################################")



print_test_results()

