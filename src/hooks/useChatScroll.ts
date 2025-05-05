import { useRef, useCallback, useEffect } from "react";

export function useChatScroll(deps: ReadonlyArray<unknown>) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, scrollToEnd]);

  return { chatEndRef, scrollToEnd };
} 