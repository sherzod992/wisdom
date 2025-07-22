import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

import MemberModel from '../schema/Member.model';
import { AuthProvider, Member } from '../models/libs/types/member';

// 세션에 사용자 정보 저장
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// 세션에서 사용자 정보 복원
passport.deserializeUser(async (id: string, done) => {
  try {
    const member = await MemberModel.findById(id);
    done(null, member);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy (이메일/닉네임 + 비밀번호)
passport.use(new LocalStrategy({
  usernameField: 'memberIdentifier', // 이메일 또는 닉네임
  passwordField: 'memberPassword'
}, async (memberIdentifier: string, password: string, done) => {
  try {
    // 이메일 또는 닉네임으로 사용자 찾기
    const member = await MemberModel.findOne({
      $or: [
        { memberEmail: memberIdentifier },
        { memberNick: memberIdentifier }
      ]
    }).select('+memberPassword');

    if (!member) {
      return done(null, false, { message: '사용자를 찾을 수 없습니다.' });
    }

    if (!member.memberPassword) {
      return done(null, false, { message: '소셜 로그인 계정입니다. 소셜 로그인을 이용해주세요.' });
    }

    const isMatch = await bcrypt.compare(password, member.memberPassword);
    if (!isMatch) {
      return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
    }

    return done(null, member);
  } catch (error) {
    return done(error);
  }
}));

export default passport; 