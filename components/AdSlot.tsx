import AdUnit from "@/components/AdUnit";
import { adConfig, adsAllowed, type AdPlacement } from "@/lib/advertising";
export default async function AdSlot({ placement = "content", variant = 0, name }: { placement?: AdPlacement; variant?: number; name?: string }) {
 if (!await adsAllowed()) return null;
 return <AdUnit placement={placement} {...adConfig(placement)} variant={variant} name={name}/>;
}
