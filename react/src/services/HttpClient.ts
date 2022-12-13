import axios from "axios";

export const httpClient = axios.create({
    baseURL: "http://localhost:8080/api/",
    headers: {
    'Accept': 'application/x-www-form-urlencoded, application/json', 
    'Access-Control-Allow-Origin' : '*',
    }
});

export default httpClient;