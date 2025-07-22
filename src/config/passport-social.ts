import passport from 'passport';
const KakaoStrategy = require('passport-kakao').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

import MemberModel from '../schema/Member.model';
import { AuthProvider, SocialProfile } from '../models/libs/types/member';

// Kakao Strategy
passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID!,
  clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
  callbackURL: process.env.KAKAO_CALLBACK_URL!
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    const socialProfile: SocialProfile = {
      id: profile.id,
      nickname: profile.displayName || profile.username,
      email: profile._json?.kakao_account?.email,
      profileImage: profile._json?.properties?.profile_image,
      provider: AuthProvider.KAKAO
    };

    await handleSocialLogin(socialProfile, done);
  } catch (error) {
    return done(error);
  }
}));

// Naver Strategy
passport.use(new NaverStrategy({
  clientID: process.env.NAVER_CLIENT_ID!,
  clientSecret: process.env.NAVER_CLIENT_SECRET!,
  callbackURL: process.env.NAVER_CALLBACK_URL!
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    const socialProfile: SocialProfile = {
      id: profile.id,
      nickname: profile.displayName,
      email: profile.emails?.[0]?.value,
      profileImage: profile.photos?.[0]?.value,
      provider: AuthProvider.NAVER
    };

    await handleSocialLogin(socialProfile, done);
  } catch (error) {
    return done(error);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: process.env.GITHUB_CALLBACK_URL!
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    const socialProfile: SocialProfile = {
      id: profile.id,
      nickname: profile.username,
      email: profile.emails?.[0]?.value,
      profileImage: profile.photos?.[0]?.value,
      provider: AuthProvider.GITHUB
    };

    await handleSocialLogin(socialProfile, done);
  } catch (error) {
    return done(error);
  }
}));

// 소셜 로그인 공통 처리 함수
async function handleSocialLogin(socialProfile: SocialProfile, done: any) {
  try {
    // 기존 소셜 계정 찾기
    let member = await MemberModel.findOne({
      provider: socialProfile.provider,
      providerId: socialProfile.id
    });

    if (member) {
      // 기존 계정이 있으면 로그인
      return done(null, member);
    }

    // 같은 이메일로 가입된 계정이 있는지 확인
    if (socialProfile.email) {
      const existingMember = await MemberModel.findOne({
        memberEmail: socialProfile.email
      });

      if (existingMember) {
        // 기존 계정에 소셜 정보 연결
        existingMember.provider = socialProfile.provider;
        existingMember.providerId = socialProfile.id;
        await existingMember.save();
        return done(null, existingMember);
      }
    }

    // 새 계정 생성
    const newMember = new MemberModel({
      memberNick: socialProfile.nickname || `user_${socialProfile.id}`,
      memberEmail: socialProfile.email,
      memberImage: socialProfile.profileImage,
      provider: socialProfile.provider,
      providerId: socialProfile.id
    });

    await newMember.save();
    return done(null, newMember);

  } catch (error) {
    return done(error);
  }
}

export default passport; 