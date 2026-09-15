import {Schema,model} from "mongoose";
const schema=new Schema({
 customerId:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},workerId:{type:Schema.Types.ObjectId,ref:"Worker"},serviceId:{type:Schema.Types.ObjectId,ref:"Service",required:true},cooperativeId:{type:Schema.Types.ObjectId,ref:"Cooperative"},
 location:{address:{type:String,required:true},type:{type:String,enum:["Point"],default:"Point"},coordinates:{type:[Number],required:true}},scheduledDate:String,scheduledTime:String,emergency:Boolean,description:String,
 fareMin:Number,fareMax:Number,fare:Number,eta:Number,distance:Number,matchScore:Number,
 status:{type:String,enum:["REQUESTED","MATCHING","WORKER_ASSIGNED","ACCEPTED","ON_THE_WAY","ARRIVED","SERVICE_STARTED","COMPLETED","CANCELLED"],default:"REQUESTED",index:true},
 paymentStatus:{type:String,enum:["PENDING","PAID","FAILED"],default:"PENDING"}
},{timestamps:true}); schema.index({location:"2dsphere"}); export default model("Booking",schema);