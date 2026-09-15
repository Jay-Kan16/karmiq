import {Server} from "socket.io"; import type {Server as HttpServer} from "http";
export function initSocket(server:HttpServer){
  const io=new Server(server,{
    cors:{
      origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((s) => s.trim()) : true,
      credentials: true
    }
  });
  io.on("connection",socket=>{
    socket.on("booking:join",(bookingId:string)=>socket.join(`booking:${bookingId}`));
    socket.on("chat:message",(p:{bookingId:string;text:string;sender:string})=>socket.to(`booking:${p.bookingId}`).emit("chat:message",p));
    socket.on("worker:location:update",(p:{bookingId:string;lat:number;lng:number})=>socket.to(`booking:${p.bookingId}`).emit("worker:location",{lat:p.lat,lng:p.lng}));
  });
  return io;
}
