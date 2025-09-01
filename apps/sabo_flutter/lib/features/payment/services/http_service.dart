// HTTP Service for Payment API calls
import 'dart:convert';
import 'package:http/http.dart' as http;

class HttpService {
  static const String baseUrl = 'http://localhost:3000'; // Adjust as needed

  static Future<http.Response> get(String url) async {
    final response = await http.get(
      Uri.parse('$baseUrl$url'),
      headers: {'Content-Type': 'application/json'},
    );
    return response;
  }

  static Future<http.Response> post(String url, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl$url'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return response;
  }

  static Future<http.Response> put(String url, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl$url'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return response;
  }

  static Future<http.Response> delete(String url) async {
    final response = await http.delete(
      Uri.parse('$baseUrl$url'),
      headers: {'Content-Type': 'application/json'},
    );
    return response;
  }
}
