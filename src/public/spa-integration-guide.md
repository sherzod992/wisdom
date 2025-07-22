# SPA 소셜 로그인 통합 가이드

## 🎯 현재 상태
- ✅ 백엔드 API 엔드포인트 구현 완료
- ✅ 인증 JavaScript 라이브러리 (`/js/auth.js`) 생성 완료
- ✅ 예시 HTML 페이지 (`/auth-example.html`) 생성 완료

## 📋 SPA에 추가해야 할 구체적인 부분들

### 1. **라우팅 설정**

#### React Router 예시
```jsx
// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductsPage from './pages/ProductsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/product/all" element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
```

#### Vue Router 예시
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import SignupPage from '@/views/SignupPage.vue'
import ProductsPage from '@/views/ProductsPage.vue'

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  { 
    path: '/product/all', 
    component: ProductsPage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 인증 가드
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('accessToken')) {
    next('/login')
  } else {
    next()
  }
})
```

### 2. **인증 상태 관리**

#### React Context API 예시
```jsx
// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 토큰으로 사용자 정보 가져오기
      fetchUserInfo(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch('/member/detail', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await fetch('/member/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.member);
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Vuex/Pinia 예시
```javascript
// stores/auth.js (Pinia)
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('accessToken'),
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      try {
        const response = await fetch('/member/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        
        if (response.ok) {
          const data = await response.json();
          this.token = data.accessToken;
          this.user = data.member;
          localStorage.setItem('accessToken', data.accessToken);
          return { success: true };
        } else {
          const error = await response.json();
          return { success: false, message: error.message };
        }
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('accessToken');
    }
  }
})
```

### 3. **로그인/회원가입 컴포넌트**

#### React 로그인 컴포넌트
```jsx
// components/LoginForm.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    memberIdentifier: '',
    memberPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      navigate('/product/all');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `/member/auth/${provider}`;
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      
      <input
        type="text"
        placeholder="이메일 또는 닉네임"
        value={formData.memberIdentifier}
        onChange={(e) => setFormData({
          ...formData, 
          memberIdentifier: e.target.value
        })}
        required
      />
      
      <input
        type="password"
        placeholder="비밀번호"
        value={formData.memberPassword}
        onChange={(e) => setFormData({
          ...formData, 
          memberPassword: e.target.value
        })}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>

      <div className="social-login">
        <button type="button" onClick={() => handleSocialLogin('kakao')}>
          카카오 로그인
        </button>
        <button type="button" onClick={() => handleSocialLogin('naver')}>
          네이버 로그인
        </button>
        <button type="button" onClick={() => handleSocialLogin('github')}>
          깃허브 로그인
        </button>
      </div>
    </form>
  );
};
```

#### Vue 로그인 컴포넌트
```vue
<!-- components/LoginForm.vue -->
<template>
  <form @submit.prevent="handleLogin">
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <input
      v-model="formData.memberIdentifier"
      type="text"
      placeholder="이메일 또는 닉네임"
      required
    />
    
    <input
      v-model="formData.memberPassword"
      type="password"
      placeholder="비밀번호"
      required
    />
    
    <button type="submit" :disabled="loading">
      {{ loading ? '로그인 중...' : '로그인' }}
    </button>

    <div class="social-login">
      <button type="button" @click="handleSocialLogin('kakao')">
        카카오 로그인
      </button>
      <button type="button" @click="handleSocialLogin('naver')">
        네이버 로그인
      </button>
      <button type="button" @click="handleSocialLogin('github')">
        깃허브 로그인
      </button>
    </div>
  </form>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const formData = ref({
      memberIdentifier: '',
      memberPassword: ''
    })
    const error = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      loading.value = true
      error.value = ''

      const result = await authStore.login(formData.value)
      
      if (result.success) {
        router.push('/product/all')
      } else {
        error.value = result.message
      }
      loading.value = false
    }

    const handleSocialLogin = (provider) => {
      window.location.href = `/member/auth/${provider}`
    }

    return {
      formData,
      error,
      loading,
      handleLogin,
      handleSocialLogin
    }
  }
}
</script>
```

### 4. **API 통신 헬퍼**

#### API 서비스 클래스
```javascript
// services/api.js
class ApiService {
  constructor() {
    this.baseURL = window.location.origin;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (response.status === 401) {
        // 토큰 만료 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      return { success: response.ok, data, status: response.status };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 인증 관련 API
  async login(credentials) {
    return this.request('/member/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async signup(userData) {
    return this.request('/member/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getUserDetail() {
    return this.request('/member/detail');
  }

  async forgotPassword(email) {
    return this.request('/member/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ memberEmail: email })
    });
  }

  // 강의 관련 API
  async getLessons() {
    return this.request('/product/all');
  }

  async getLesson(id) {
    return this.request(`/product/${id}`);
  }
}

export default new ApiService();
```

### 5. **보호된 라우트 컴포넌트**

#### React ProtectedRoute
```jsx
// components/ProtectedRoute.jsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
```

### 6. **환경별 설정**

#### 개발/프로덕션 환경 설정
```javascript
// config/env.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3011',
    SOCIAL_LOGIN_URLS: {
      kakao: 'http://localhost:3011/member/auth/kakao',
      naver: 'http://localhost:3011/member/auth/naver',
      github: 'http://localhost:3011/member/auth/github'
    }
  },
  production: {
    API_BASE_URL: 'https://yourdomain.com',
    SOCIAL_LOGIN_URLS: {
      kakao: 'https://yourdomain.com/member/auth/kakao',
      naver: 'https://yourdomain.com/member/auth/naver',
      github: 'https://yourdomain.com/member/auth/github'
    }
  }
};

const env = process.env.NODE_ENV || 'development';
export default config[env];
```

## 🚀 통합 체크리스트

### 필수 구현 사항
- [ ] 라우팅 설정 (React Router / Vue Router)
- [ ] 인증 상태 관리 (Context API / Vuex/Pinia)
- [ ] 로그인/회원가입 컴포넌트
- [ ] 보호된 라우트 구현
- [ ] API 통신 서비스
- [ ] 에러 처리 및 로딩 상태

### 선택적 구현 사항
- [ ] 비밀번호 재설정 페이지
- [ ] 소셜 로그인 콜백 처리
- [ ] 토큰 자동 갱신
- [ ] 오프라인 지원
- [ ] 다국어 지원

## 📝 테스트 방법

1. **현재 예시 페이지 확인**
   ```
   http://localhost:3011/auth-example.html
   ```

2. **API 직접 테스트**
   ```bash
   # 로그인 테스트
   curl -X POST http://localhost:3011/member/login \
     -H "Content-Type: application/json" \
     -d '{"memberNick":"test","memberPassword":"1234"}'
   ```

3. **소셜 로그인 테스트**
   ```
   http://localhost:3011/member/auth/kakao
   ```

이 가이드를 참고하여 SPA에 소셜 로그인을 통합하시면 됩니다! 