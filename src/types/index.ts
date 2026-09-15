export type Role="customer"|"worker"|"admin"; export type BookingStatus="SEARCHING"|"REQUESTED"|"MATCHING"|"WORKER_ASSIGNED"|"ACCEPTED"|"ON_THE_WAY"|"ARRIVED"|"SERVICE_STARTED"|"COMPLETED"|"CANCELLED"|"PAYMENT"|"RATING"; export type PaymentStatus="PENDING"|"PAID"|"FAILED"; export type Availability="online"|"offline"|"busy";
export interface User{id:string;name:string;phone:string;email?:string;role:Role;avatar?:string;address?:string}
export interface Worker extends User{role:"worker";skill:string;skills:string[];experience:number;rating:number;distance:number;availability:Availability;verified:boolean;cooperative:string;jobs:number;workload:number;location:{lat:number;lng:number;label?:string};certificate?:string;earnings:{today:number;week:number;month:number}}
export interface Service{id:string;name:string;description?:string;icon:string;startingPrice:number;nearby?:number;category:string;emergency:boolean}
export interface Booking{id:string;customerId:string;workerId?:string;serviceId:string;serviceName:string;location:{lat:number;lng:number;address:string};date:string;time:string;emergency:boolean;description?:string;fareMin:number;fareMax:number;fare:number;status:BookingStatus;paymentStatus:PaymentStatus;createdAt:string;eta?:number;distance?:number;matchScore?:number}
export interface Rating{id:string;bookingId:string;stars:number;tags:string[];comment:string}
export interface Notification{id:string;type:"booking"|"payment"|"system";title:string;message:string;time?:string;read:boolean}
export interface Complaint{id:string;bookingId:string;issue:string;status:"IN REVIEW"|"RESOLVED";customer?:string;worker?:string}
export interface DemandForecast{service:string;current:number;predicted:number;level:"HIGH"|"MEDIUM"|"LOW"} export interface WorkforceRecommendation{area:string;service:string;expected:number;available:number;required:number;gap:number;recommendation:string}

export interface Customer extends User { role:"customer"; addresses:{id:string;label:string;address:string}[] }
