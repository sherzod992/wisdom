import express from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import MemberModel from './schema/Member.model';
import { AuthProvider, MemberInput } from './models/libs/types/member';

const router = express.Router();

// 이메일 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 일반 로그인 (POST)
router.post('/login', passport.authenticate('local', {
  successRedirect: '/admin/product/all',
  failureRedirect: '/admin/signup',
  failureFlash: false
}));

// 일반 회원가입 (POST)
router.post('/signup', async (req, res) => {
  try {
    const { memberNick, memberPhone, memberEmail, memberPassword, confirmPassword } = req.body;

    if (memberPassword !== confirmPassword) {
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 중복 확인
    const existingMember = await MemberModel.findOne({
      $or: [
        { memberNick },
        { memberPhone },
        { memberEmail }
      ]
    });

    if (existingMember) {
      return res.status(400).json({ message: '이미 존재하는 닉네임, 전화번호 또는 이메일입니다.' });
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(memberPassword, 12);

    const memberInput: MemberInput = {
      memberNick,
      memberPhone,
      memberEmail,
      memberPassword: hashedPassword,
      provider: AuthProvider.LOCAL
    };

    const newMember = await MemberModel.create(memberInput);
    
    // 자동 로그인
    req.login(newMember, (err) => {
      if (err) {
        return res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
      }
      return res.redirect('/admin/product/all');
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 비밀번호 재설정 요청 (POST)
router.post('/forgot-password', async (req, res) => {
  try {
    const { memberEmail } = req.body;

    const member = await MemberModel.findOne({ memberEmail });
    if (!member) {
      return res.status(404).json({ message: '해당 이메일로 가입된 계정을 찾을 수 없습니다.' });
    }

    if (member.provider !== AuthProvider.LOCAL) {
      return res.status(400).json({ message: '소셜 로그인 계정은 비밀번호 재설정이 불가능합니다.' });
    }

    // 재설정 토큰 생성
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1시간

    // 토큰을 임시로 memberDesk에 저장 (실제로는 별도 필드나 Redis 사용 권장)
    member.memberDesk = `reset:${resetToken}:${resetTokenExpiry.getTime()}`;
    await member.save();

    // 이메일 발송
    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
    
    await transporter.sendMail({
      to: memberEmail,
      subject: '비밀번호 재설정',
      html: `
        <h2>비밀번호 재설정</h2>
        <p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>이 링크는 1시간 동안 유효합니다.</p>
      `
    });

    res.json({ message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: '비밀번호 재설정 요청 중 오류가 발생했습니다.' });
  }
});

// 비밀번호 재설정 페이지 (GET)
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const member = await MemberModel.findOne({
      memberDesk: { $regex: `^reset:${token}:` }
    });

    if (!member) {
      return res.render('auth/reset-password', { 
        error: '유효하지 않은 토큰입니다.',
        token: null 
      });
    }

    // 토큰 만료 확인
    const tokenData = member.memberDesk!.split(':');
    const expiry = parseInt(tokenData[2]);
    
    if (Date.now() > expiry) {
      return res.render('auth/reset-password', { 
        error: '토큰이 만료되었습니다.',
        token: null 
      });
    }

    res.render('auth/reset-password', { 
      error: null,
      token,
      success: null 
    });

  } catch (error) {
    console.error('Reset password page error:', error);
    res.render('auth/reset-password', { 
      error: '오류가 발생했습니다.',
      token: null 
    });
  }
});

// 비밀번호 재설정 처리 (POST)
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.render('auth/reset-password', {
        error: '비밀번호가 일치하지 않습니다.',
        token,
        success: null
      });
    }

    const member = await MemberModel.findOne({
      memberDesk: { $regex: `^reset:${token}:` }
    });

    if (!member) {
      return res.render('auth/reset-password', {
        error: '유효하지 않은 토큰입니다.',
        token: null,
        success: null
      });
    }

    // 토큰 만료 확인
    const tokenData = member.memberDesk!.split(':');
    const expiry = parseInt(tokenData[2]);
    
    if (Date.now() > expiry) {
      return res.render('auth/reset-password', {
        error: '토큰이 만료되었습니다.',
        token: null,
        success: null
      });
    }

    // 비밀번호 업데이트
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    member.memberPassword = hashedPassword;
    member.memberDesk = ''; // 토큰 삭제
    await member.save();

    res.render('auth/reset-password', {
      error: null,
      token: null,
      success: '비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.render('auth/reset-password', {
      error: '비밀번호 재설정 중 오류가 발생했습니다.',
      token: req.params.token,
      success: null
    });
  }
});

// ===== 소셜 로그인 라우트 =====

// Kakao 로그인
router.get('/kakao', (req, res, next) => {
  if (!process.env.KAKAO_CLIENT_ID) {
    return res.redirect('/admin/signup?error=kakao_not_configured');
  }
  passport.authenticate('kakao')(req, res, next);
});

router.get('/kakao/callback', 
  passport.authenticate('kakao', { failureRedirect: '/admin/signup?error=kakao_failed' }),
  (req, res) => {
    // 프론트엔드에서 호출된 경우 프론트엔드로, 관리자에서 호출된 경우 관리자로
    const referrer = req.get('Referrer') || '';
    if (referrer.includes('/admin/')) {
      res.redirect('/admin/product/all');
    } else {
      res.redirect('/product/all');
    }
  }
);

// Naver 로그인
router.get('/naver', (req, res, next) => {
  if (!process.env.NAVER_CLIENT_ID) {
    return res.redirect('/admin/signup?error=naver_not_configured');
  }
  passport.authenticate('naver')(req, res, next);
});

router.get('/naver/callback',
  passport.authenticate('naver', { failureRedirect: '/admin/signup?error=naver_failed' }),
  (req, res) => {
    // 프론트엔드에서 호출된 경우 프론트엔드로, 관리자에서 호출된 경우 관리자로
    const referrer = req.get('Referrer') || '';
    if (referrer.includes('/admin/')) {
      res.redirect('/admin/product/all');
    } else {
      res.redirect('/product/all');
    }
  }
);

// GitHub 로그인
router.get('/github', (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.redirect('/admin/signup?error=github_not_configured');
  }
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/admin/signup?error=github_failed' }),
  (req, res) => {
    // 프론트엔드에서 호출된 경우 프론트엔드로, 관리자에서 호출된 경우 관리자로
    const referrer = req.get('Referrer') || '';
    if (referrer.includes('/admin/')) {
      res.redirect('/admin/product/all');
    } else {
      res.redirect('/product/all');
    }
  }
);

// 로그아웃
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: '로그아웃 중 오류가 발생했습니다.' });
    }
    res.redirect('/admin/signup');
  });
});

export default router; 