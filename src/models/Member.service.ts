import MemberModel from "../schema/Member.model";
import { MemberInput, Member, LoginInput, MemberUpdateInput } from "../libs/types/member";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import Errors,{ HttpCode,Message } from "../libs/Errors";
import * as bcrypt from "bcryptjs";
import { shapeIntoMongooseObjectId } from "../libs/config";
import LessonModel from "../schema/Lesson.model";

class MemberService {
  private readonly memberModel;
  private readonly lessonModel;

  constructor() {
    this.memberModel = MemberModel;
    this.lessonModel = LessonModel;
  }

  /** SPA Students Page **/


  public async getTeacher(): Promise<Member>{
    const result = await this.memberModel
    .findOne({ memberType: MemberType.ADMIN})
    .lean()
    .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result as unknown as Member;
  }
  public async signup(input: MemberInput): Promise<Member> {
    if (!input.memberNick || !input.memberPhone || !input.memberPassword) {
      throw new Errors(HttpCode.BAD_REQUEST,Message.SOMETHING_WENT_WRONG);
    }
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);
  
    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result.toJSON() as unknown as Member;
    } catch (err) {
      console.error("Signup Error:", err);
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
    }
  }
  public async login(input: LoginInput): Promise<Member> {
    if (!input.memberNick || !input.memberPassword) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    }
    const member = await this.memberModel.findOne(
      { memberNick: input.memberNick, memberStatus: { $ne: MemberStatus.DELETE } },
      { memberNick: 1, memberPassword: 1, memberStatus: 1 }
    ).exec();
  
    if (!member) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    }
  
    // === PAROL TO‘G‘RILIGINI TEKSHIRISH ===
    const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword);
    if (!isMatch) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.WRONG_PASSWORD);
    }
  
    // === FOYDALANUVCHINI TO‘LIQ YUKLASH ===
    const result = await this.memberModel.findById(member._id).exec();
    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    }
  
    return result.toJSON() as unknown as Member;
  }
  public async getMemberDetail(member: Member): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = await this.memberModel
      .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
      .lean<Member>()
      .exec();
  
    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    }
  
    return result;
  }
  public async updateMember(member: Member, input: MemberInput): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = await this.memberModel.findOneAndUpdate({ _id: memberId }, input, { new: true }).exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result.toObject() as unknown as Member;
  }
  public async getTopUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({ memberStatus: MemberStatus.ACTIVE, memberPoints: { $gte: 5 } })
      .sort({ memberPoints: -1 })
      .limit(4)
      .lean<Member[]>()
      .exec();
  
    if (!result || result.length === 0) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
  
    return result;
  }


















/**SSR Admin panel */
  public async postSignup(input: MemberInput): Promise<Member> {
    // const exist = await this.memberModel
    //   .findOne({ memberType: MemberType.ADMIN })
    //   .lean<Member>()
    //   .exec();

    // if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);
     try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result.toObject() as unknown as Member;
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
  public async postLogin(input:LoginInput):Promise<Member>{
    const member = await this.memberModel
    .findOne({memberNick: input.memberNick},{memberNick: 1, memberPassword: 1 })
    .exec();
    if (!member) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    }
    if (member.memberStatus === MemberStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }
    const result = await this.memberModel.findById(member._id).exec();
    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    }
  
    return result.toObject() as unknown as Member;
  }
  public async getAllStudents(): Promise<Member[]> {
    const result = await this.memberModel
        .find({ memberType: MemberType.STUDENT })
        .lean<Member[]>()
        .exec();

    if (!result || result.length === 0) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
}

public async getAllTeacher(): Promise<Member[]> {
    const result = await this.memberModel
        .find({ memberType: MemberType.TEACHER })
        .lean<Member[]>()
        .exec();
        
    if (!result || result.length === 0) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
}
  public async updateChosenUser(input: MemberUpdateInput): Promise<Member> {
    input._id = shapeIntoMongooseObjectId(input._id);

    const result = await this.memberModel
        .findOneAndUpdate(
            { _id: input._id },
            input,
            { new: true }
        )
        .lean<Member>() // 단일 문서 반환 타입으로 수정
        .exec();

    if (!result) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result; // 반환값이 항상 Member 타입이 되도록 보장
}
public async getDashboardStats(): Promise<any> {
  const totalStudents = await this.memberModel.countDocuments({ memberType: MemberType.STUDENT, memberStatus: MemberStatus.ACTIVE });
  const totalTeachers = await this.memberModel.countDocuments({ memberType: MemberType.TEACHER,  memberStatus: MemberStatus.ACTIVE });
  const totalBlckedStudents = await this.memberModel.countDocuments({ memberType: MemberType.STUDENT, memberStatus: MemberStatus.BLOCK});
  const totalBlockedTeachers = await this.memberModel.countDocuments({ memberType: MemberType.TEACHER, memberStatus: MemberStatus.BLOCK });
  return {
    totalStudents,
    totalTeachers,
    totalBlckedStudents,
    totalBlockedTeachers,
    };
  }
  
  public async getRecentActiveStudents(): Promise<any> {
    // const tenDaysAgo = new Date();
    // tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    // $gte: tenDaysAgo 
    const newStudents = await this.memberModel.find({memberType: MemberType.STUDENT, memberStatus: MemberStatus.ACTIVE});
    const newTeachers = await this.memberModel.find({memberType: MemberType.TEACHER, memberStatus: MemberStatus.ACTIVE});
    return {newStudents,newTeachers};
  }
  public async getRecentActiveTeacher(): Promise<any> {
    // const tenDaysAgo = new Date();
    // tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    // $gte: tenDaysAgo 
    const newTeachers = await this.memberModel.find({memberType: MemberType.TEACHER, memberStatus: MemberStatus.ACTIVE});
    return {newTeachers};
  }
}

export default MemberService;
