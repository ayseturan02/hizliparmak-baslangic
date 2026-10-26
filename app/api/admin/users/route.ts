import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginJson } from "@/lib/request-security";
export async function POST(request: Request) {
 if(!isSameOriginJson(request))return NextResponse.json({error:"Geçersiz kaynak."},{status:403});
 const admin=await getSessionUser();if(!admin||admin.role!=="ADMIN"||admin.isSuspended)return NextResponse.json({error:"Yönetici yetkisi gerekir."},{status:403});
 const parsed=z.object({userId:z.string().min(1),action:z.literal("RESTORE")}).safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Geçersiz işlem."},{status:400});
 try { await prisma.user.updateMany({where:{id:parsed.data.userId,role:"USER",isSuspended:true},data:{isSuspended:false}});return NextResponse.json({ok:true}); }
 catch{return NextResponse.json({error:"Askı kaldırılamadı."},{status:503});}
}
