import { Schema, model, type InferSchemaType } from "mongoose";

const pointSchema = new Schema({
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], required: true },
}, { _id: false });

const userSchema = new Schema({
  name:{type:String,required:true,trim:true}, email:{type:String,trim:true,lowercase:true,sparse:true,unique:true},
  phone:{type:String,required:true,trim:true,unique:true}, password:{type:String,required:true,select:false},
  role:{type:String,enum:["customer","worker","admin"],default:"customer",index:true},
  profileImage:String, address:String,
  location:{ type: pointSchema, required: false },
},{timestamps:true});
userSchema.index({location:"2dsphere"}, {sparse: true});
export type UserDoc=InferSchemaType<typeof userSchema>;
export default model("User",userSchema);