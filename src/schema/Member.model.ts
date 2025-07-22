import mongoose, {Schema} from 'mongoose';

import { MemberType, MemberStatus } from '../models/libs/enums/member.enum';
import { AuthProvider } from '../models/libs/types/member';

const memberSchema = new Schema({
    memberType: {
        type: String,
        enum: MemberType, 
        default: MemberType.STUDENT,
    },
    
    memberStatus : {
        type: String,
        enum: MemberStatus,
        default: MemberStatus.ACTIVE
    },

    memberNick:{
        type: String,
        index: {unique:true, sparse:true},
        required:true,
    },

    memberPhone:{
        type: String,
        index: {unique:true, sparse:true},
        required: false, // 소셜 로그인시 선택적
    },

    memberPassword : {
        type:String,
        select:false,
        minlength: 4, 
        required: false // 소셜 로그인시 선택적
    },

    memberEmail: {
        type: String,
        index: {unique:true, sparse:true},
        required: false,
    },

    provider: {
        type: String,
        enum: AuthProvider,
        default: AuthProvider.LOCAL,
    },

    providerId: {
        type: String,
        required: false,
    },

    memberAddress: {
        type: String
    },

    memberDesk: {
        type: String
    },

    memberImage: {
        type: String
    },

    memberPoints: {
        type : Number,
        default:0
    },


},{timestamps:true} //updatedAt, createdAt
)


export default mongoose.model("Member",memberSchema)