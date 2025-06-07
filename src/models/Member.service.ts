import MemberModel from "../schema/Member.model";
import { MemberInput, Member, LoginInput } from "../libs/types/member";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import Errors from "../libs/utils/Errors";
import { HttpCode, Message } from "../libs/utils/Errors";
import * as bcrypt from "bcryptjs";
class MemberService {
  private readonly memberModel;

  constructor() {
    this.memberModel = MemberModel;
  }

  /** SPA Students Page **/

  public async signup(input: MemberInput): Promise<Member> {
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
    if (member.memberStatus === MemberStatus.BLOCKED) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }
    const result = await this.memberModel.findById(member._id).exec();
    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    }
  
    return result.toObject() as unknown as Member;
  }
  
}

export default MemberService;
