import { prisma } from "@/lib/prisma";
export async function ensureCurrentWeeklyContest(){
 const now=new Date();
 const startsAt=new Date(now);startsAt.setHours(0,0,0,0);startsAt.setDate(startsAt.getDate()-((startsAt.getDay()+6)%7));
 const endsAt=new Date(startsAt);endsAt.setDate(endsAt.getDate()+7);endsAt.setMilliseconds(-1);
 const existing=await prisma.weeklyContest.findUnique({where:{startsAt}});
 if(existing)return existing;
 try{return await prisma.weeklyContest.create({data:{title:`Haftalık Hız Sınavı · ${startsAt.toLocaleDateString("tr-TR")}`,description:"Bu haftanın ortak metnini yaz, hız ve doğruluğunu ölç. Sonuçlar geliştirme aşamasındadır ve ilk sürümde istemci zamanına dayalıdır.",textContent:"Düzenli pratik, doğru parmak tekniği ve dikkatli tekrar yazma performansını geliştirir. Hız kadar doğruluk da önemlidir. Her gün kısa süre çalışmak uzun aralar vermekten daha verimlidir.",startsAt,endsAt,status:"ACTIVE"}})}catch(error){const race=await prisma.weeklyContest.findUnique({where:{startsAt}});if(race)return race;throw error;}
}
