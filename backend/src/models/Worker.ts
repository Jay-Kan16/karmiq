import { Schema, model } from "mongoose";

const pointSchema = new Schema({
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], required: true },
}, { _id: false });

const workerSchema=new Schema({
  userId:{type:Schema.Types.ObjectId,ref:"User",required:true,unique:true},
  skills:{type:[String],default:[]},services:[{type:Schema.Types.ObjectId,ref:"Service"}],experience:{type:Number,default:0},
  rating:{type:Number,default:0},totalJobs:{type:Number,default:0},availability:{type:String,enum:["online","offline","busy"],default:"offline"},
  currentLocation:{ type: pointSchema, required: false },
  workload:{type:Number,default:0},cooperativeId:{type:Schema.Types.ObjectId,ref:"Cooperative"},verificationStatus:{type:String,enum:["PENDING","VERIFIED","REJECTED"],default:"PENDING"},
  earnings:{today:{type:Number,default:0},week:{type:Number,default:0},month:{type:Number,default:0}}
},{timestamps:true});
workerSchema.index({currentLocation:"2dsphere"}, {sparse: true}); workerSchema.index({skills:1,availability:1,verificationStatus:1});
export default model("Worker",workerSchema);