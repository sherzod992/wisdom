// ====================================
// 기본 인증 시스템
// ====================================

class AuthManager {
    constructor() {
        this.baseUrl = window.location.origin;
        this.isAdminPage = window.location.pathname.startsWith('/admin');
        this.init();
    }

    init() {
        // admin 페이지에서는 JavaScript 폼 처리를 비활성화
        if (!this.isAdminPage) {
            this.bindEvents();
        }
        this.checkAuthStatus();
    }

    // 이벤트 바인딩
    bindEvents() {
        // 로그인 폼
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // 회원가입 폼
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // 로그아웃
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
    }

    // 로그인 처리
    async handleLogin(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const loginData = {
            memberNick: formData.get('memberNick'),
            memberPassword: formData.get('memberPassword')
        };

        try {
            const response = await fetch(`${this.baseUrl}/member/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            // 디버깅: 응답 구조 확인
            console.log('Login response:', result);
            console.log('Member type:', result.member?.memberType);

            if (response.ok && result.member) {
                // 토큰 저장
                if (result.accessToken) {
                    localStorage.setItem('accessToken', result.accessToken);
                }

                // 사용자 타입에 따른 리다이렉트
                if (result.member.memberType === 'ADMIN') {
                    // 관리자는 admin 페이지로
                    console.log('Redirecting to admin page');
                    window.location.href = '/admin';
                } else {
                    // 일반 사용자는 product 페이지로
                    console.log('Redirecting to product page');
                    window.location.href = '/product/all';
                }
            } else {
                alert(result.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 중 오류가 발생했습니다.');
        }
    }

    // 회원가입 처리
    async handleSignup(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const signupData = {
            memberNick: formData.get('memberNick'),
            memberPhone: formData.get('memberPhone'),
            memberPassword: formData.get('memberPassword')
        };

        // 비밀번호 확인
        const confirmPassword = formData.get('confirmPassword');
        if (signupData.memberPassword !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/member/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData)
            });

            const result = await response.json();

            if (response.ok && result.member) {
                // 토큰 저장
                if (result.accessToken) {
                    localStorage.setItem('accessToken', result.accessToken);
                }

                // 사용자 타입에 따른 리다이렉트
                if (result.member.memberType === 'ADMIN') {
                    // 관리자는 admin 페이지로
                    window.location.href = '/admin';
                } else {
                    // 일반 사용자는 product 페이지로
                    window.location.href = '/product/all';
                }
            } else {
                alert(result.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    }

    // 로그아웃 처리
    async handleLogout(e) {
        e.preventDefault();

        try {
            const response = await fetch(`${this.baseUrl}/member/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            // 로컬 토큰 삭제
            localStorage.removeItem('accessToken');
            window.location.href = '/';

        } catch (error) {
            console.error('Logout error:', error);
            // 에러가 있어도 로컬 토큰은 삭제
            localStorage.removeItem('accessToken');
            window.location.href = '/';
        }
    }

    // 인증 상태 확인
    checkAuthStatus() {
        const token = localStorage.getItem('accessToken');
        const loginRequiredElements = document.querySelectorAll('.login-required');
        const logoutRequiredElements = document.querySelectorAll('.logout-required');

        if (token) {
            // 로그인 상태
            loginRequiredElements.forEach(el => el.style.display = 'block');
            logoutRequiredElements.forEach(el => el.style.display = 'none');
        } else {
            // 비로그인 상태
            loginRequiredElements.forEach(el => el.style.display = 'none');
            logoutRequiredElements.forEach(el => el.style.display = 'block');
        }
    }
}

// DOM 로드 완료 시 AuthManager 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// 전역 함수로 내보내기 (필요시 사용)
window.AuthManager = AuthManager; 