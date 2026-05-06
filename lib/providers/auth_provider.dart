import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

// In-memory "database" of registered users (mock), now synchronized with SharedPreferences
final _registeredUsers = <String, _RegisteredUser>{};
bool _isInitialized = false;

Future<void> _initPrefs() async {
  if (_isInitialized) return;
  final prefs = await SharedPreferences.getInstance();
  final usersStr = prefs.getString('registered_users');
  if (usersStr != null) {
    try {
      final Map<String, dynamic> decoded = jsonDecode(usersStr);
      decoded.forEach((key, value) {
        _registeredUsers[key] = _RegisteredUser.fromMap(value);
      });
    } catch (e) {
      print('Error loading users: $e');
    }
  }
  _isInitialized = true;
}

Future<void> _savePrefs() async {
  final prefs = await SharedPreferences.getInstance();
  final Map<String, dynamic> encoded = {};
  _registeredUsers.forEach((key, value) {
    encoded[key] = value.toMap();
  });
  await prefs.setString('registered_users', jsonEncode(encoded));
}

class _RegisteredUser {
  final AppUser user;
  final String password;
  _RegisteredUser(this.user, this.password);

  factory _RegisteredUser.fromMap(Map<String, dynamic> map) {
    return _RegisteredUser(
      AppUser.fromMap(map['user']),
      map['password'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'user': user.toMap(),
      'password': password,
    };
  }
}

class AuthState {
  final AppUser? user;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({AppUser? user, bool? isLoading, String? error, bool clearUser = false}) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState());

  Future<void> signUp({
    required String fullName,
    required String studentId,
    required String nationalId,
    required String department,
    required String year,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _initPrefs();
      await Future.delayed(const Duration(milliseconds: 400));

      if (fullName.trim().length < 3) throw 'Please enter your full name.';

      if (!RegExp(r'^[Nn][0-9]+[A-Za-z]?[0-9]*$').hasMatch(studentId)) {
        throw 'Invalid Student ID (e.g. N02124567A08).';
      }

      if (!RegExp(r'^[0-9]{2}-[0-9]{6,7}[A-Za-z][0-9]{2}$').hasMatch(nationalId)) {
        throw 'Invalid National ID format (e.g. 00-000000A00).';
      }

      if (password.length < 6) throw 'Password must be at least 6 characters.';

      final key = studentId.toUpperCase();
      if (_registeredUsers.containsKey(key)) {
        throw 'An account with that Student ID already exists.';
      }

      final user = AppUser(
        studentId: key,
        fullName: fullName.trim(),
        department: department,
        year: year,
      );

      _registeredUsers[key] = _RegisteredUser(user, password);
      await _savePrefs();
      state = state.copyWith(user: user, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  Future<void> login(String studentId, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _initPrefs();
      await Future.delayed(const Duration(milliseconds: 400));

      if (!RegExp(r'^[Nn][0-9]+[A-Za-z]?[0-9]*$').hasMatch(studentId)) {
        throw 'Invalid Student ID format.';
      }

      final key = studentId.toUpperCase();
      final registered = _registeredUsers[key];

      if (registered == null) {
        throw 'No account found. Please sign up first.';
      }

      if (registered.password != password) {
        throw 'Incorrect password.';
      }

      state = state.copyWith(user: registered.user, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  void logout() {
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
