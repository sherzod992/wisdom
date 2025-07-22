// ====================================
// 프론트엔드 SPA용 인증 시스템
// ====================================

class AuthManager {
    constructor() {
        this.baseUrl = window.location.origin;
        this.init();
    }

    init() {
        this.bindEvents();
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

        // 소셜 로그인 버튼들
        const socialButtons = document.querySelectorAll('.social-login-btn');
        socialButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // 비밀번호 재설정
        const forgotPasswordBtn = document.getElementById('forgot-password-btn');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => this.handleForgotPassword(e));
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
            memberNick: formData.get('memberIdentifier'), // 이메일 또는 닉네임
            memberPassword: formData.get('memberPassword')
        };

        try {
            this.showLoading('로그인 중...');

            const response = await fetch(`${this.baseUrl}/member/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok && result.member) {
                this.showSuccess('로그인 성공!');
                // 토큰 저장
                if (result.accessToken) {
                    localStorage.setItem('accessToken', result.accessToken);
                }
                // 리다이렉트
                setTimeout(() => {
                    window.location.href = '/product/all';
                }, 1000);
            } else {
                this.showError(result.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('로그인 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    // 회원가입 처리
    async handleSignup(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const signupData = {
            memberNick: formData.get('memberNick'),
            memberEmail: formData.get('memberEmail'),
            memberPhone: formData.get('memberPhone'),
            memberPassword: formData.get('memberPassword')
        };

        // 비밀번호 확인
        const confirmPassword = formData.get('confirmPassword');
        if (signupData.memberPassword !== confirmPassword) {
            this.showError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            this.showLoading('회원가입 중...');

            const response = await fetch(`${this.baseUrl}/member/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData)
            });

            const result = await response.json();

            if (response.ok && result.member) {
                this.showSuccess('회원가입 성공! 자동 로그인됩니다.');
                // 토큰 저장
                if (result.accessToken) {
                    localStorage.setItem('accessToken', result.accessToken);
                }
                // 리다이렉트
                setTimeout(() => {
                    window.location.href = '/product/all';
                }, 1000);
            } else {
                this.showError(result.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showError('회원가입 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    // 소셜 로그인 처리
    async handleSocialLogin(e) {
        e.preventDefault();

        const provider = e.currentTarget.dataset.provider;
        if (!provider) {
            this.showError('소셜 로그인 제공자를 찾을 수 없습니다.');
            return;
        }

        try {
            this.showLoading(`${provider} 로그인 중...`);

            // 소셜 로그인 URL로 이동
            window.location.href = `${this.baseUrl}/member/auth/${provider}`;

        } catch (error) {
            console.error('Social login error:', error);
            this.showError(`${provider} 로그인 중 오류가 발생했습니다.`);
            this.hideLoading();
        }
    }

    // 비밀번호 재설정 요청
    async handleForgotPassword(e) {
        e.preventDefault();

        const email = prompt('비밀번호를 재설정할 이메일 주소를 입력하세요:');
        if (!email) return;

        try {
            this.showLoading('재설정 링크 발송 중...');

            const response = await fetch(`${this.baseUrl}/member/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ memberEmail: email })
            });

            const result = await response.json();

            if (response.ok) {
                this.showSuccess(result.message || '재설정 링크가 이메일로 발송되었습니다.');
            } else {
                this.showError(result.message || '이메일 발송에 실패했습니다.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showError('비밀번호 재설정 요청 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
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

            this.showSuccess('로그아웃되었습니다.');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);

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

    // UI 헬퍼 메소드들
    showLoading(message = '처리 중...') {
        this.hideAllMessages();
        const loadingEl = document.getElementById('loading-message') || this.createMessageElement('loading-message');
        loadingEl.textContent = message;
        loadingEl.style.display = 'block';
        loadingEl.className = 'message loading-message';
    }

    hideLoading() {
        const loadingEl = document.getElementById('loading-message');
        if (loadingEl) loadingEl.style.display = 'none';
    }

    showSuccess(message) {
        this.hideAllMessages();
        const successEl = document.getElementById('success-message') || this.createMessageElement('success-message');
        successEl.textContent = message;
        successEl.style.display = 'block';
        successEl.className = 'message success-message';
    }

    showError(message) {
        this.hideAllMessages();
        const errorEl = document.getElementById('error-message') || this.createMessageElement('error-message');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        errorEl.className = 'message error-message';
    }

    hideAllMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => msg.style.display = 'none');
    }

    createMessageElement(id) {
        const el = document.createElement('div');
        el.id = id;
        el.style.cssText = `
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            text-align: center;
            display: none;
        `;

        if (id.includes('error')) {
            el.style.cssText += 'background-color: #ffe6e6; color: #d32f2f; border: 1px solid #d32f2f;';
        } else if (id.includes('success')) {
            el.style.cssText += 'background-color: #e6ffe6; color: #2e7d32; border: 1px solid #2e7d32;';
        } else if (id.includes('loading')) {
            el.style.cssText += 'background-color: #e3f2fd; color: #1565c0; border: 1px solid #1565c0;';
        }

        // 폼 컨테이너나 body에 추가
        const container = document.querySelector('.auth-container') || document.body;
        container.appendChild(el);

        return el;
    }
}

// DOM 로드 완료 시 AuthManager 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// 전역 함수로 내보내기 (필요시 사용)
window.AuthManager = AuthManager; 