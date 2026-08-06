import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { SAMPLE_PROPERTIES, SAMPLE_TEAM, type Property, type TeamMember } from "./data";

export function useProperties() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("properties")
          .select("*")
          .eq("status", "Active")
          .order("created_at", { ascending: false });
        if (!active) return;
        if (error || !rows || rows.length === 0) {
          setData(SAMPLE_PROPERTIES);
        } else {
          setData(rows as Property[]);
        }
      } catch {
        if (active) setData(SAMPLE_PROPERTIES);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { data, loading };
}

export function useTeam() {
  const [data, setData] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("team_members")
          .select("*")
          .order("display_order", { ascending: true });
        if (!active) return;
        setData(error || !rows || rows.length === 0 ? SAMPLE_TEAM : (rows as TeamMember[]));
      } catch {
        if (active) setData(SAMPLE_TEAM);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { data, loading };
}
