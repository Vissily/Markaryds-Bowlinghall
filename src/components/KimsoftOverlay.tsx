import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BASE_W = 1920;
const BASE_H = 1080;

const KimsoftOverlay = () => {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [scale, setScale] = useState(0.5);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.functions.invoke("kimsoft-overlay").then(({ data, error }) => {
      if (error || !data?.html) setFailed(true);
      else setHtml(data.html);
    });
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / BASE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (failed) return null;

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-lg border border-border bg-card"
      style={{ height: BASE_H * scale }}
    >
      {html && (
        <iframe
          title="Live från hallen"
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin"
          style={{ width: BASE_W, height: BASE_H, transform: `scale(${scale})`, transformOrigin: "top left", border: 0 }}
        />
      )}
    </div>
  );
};

export default KimsoftOverlay;
