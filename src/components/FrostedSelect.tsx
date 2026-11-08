import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";

interface FrostedSelectProps {
  id: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function FrostedSelect({ id, name, value, options, onChange, disabled = false, required = false }: FrostedSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const search = useRef({ text: "", time: 0 });
  const expanded = open && !disabled;

  useEffect(() => {
    if (!expanded) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [expanded]);

  useEffect(() => {
    const list = menu.current;
    const option = list?.children[activeIndex] as HTMLElement | undefined;
    if (!expanded || !list || !option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [expanded, activeIndex]);

  const choose = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Tab") { setOpen(false); return; }
    if (event.key === "Escape") {
      if (expanded) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const current = expanded ? activeIndex : selectedIndex;
      const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
        : (current + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      setActiveIndex(!expanded && (event.key === "ArrowDown" || event.key === "ArrowUp") ? selectedIndex : next);
      setOpen(true);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (expanded) choose(activeIndex);
      else { setActiveIndex(selectedIndex); setOpen(true); }
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const text = (now - search.current.time < 700 ? search.current.text : "") + event.key.toLowerCase();
      search.current = { text, time: now };
      const index = options.findIndex((option) => option.label.toLowerCase().startsWith(text));
      if (index >= 0) { setActiveIndex(index); setOpen(true); }
    }
  };

  return (
    <div ref={container} className="frosted-select" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <input type="hidden" name={name} value={value} disabled={disabled} />
      <button ref={trigger} id={id} type="button" role="combobox" aria-expanded={expanded}
        aria-controls={`${id}-options`} aria-labelledby={`${id}-label ${id}-value`}
        aria-required={required} aria-haspopup="listbox" aria-activedescendant={expanded ? `${id}-option-${activeIndex}` : undefined}
        disabled={disabled} className="input frosted-select-trigger" onKeyDown={handleKeyDown}
        onClick={() => { setActiveIndex(selectedIndex); search.current = { text: "", time: 0 }; setOpen(!expanded); }}>
        <span id={`${id}-value`}>{options[selectedIndex]?.label}</span>
        <ChevronDown className="frosted-select-chevron" aria-hidden="true" />
      </button>
      {expanded && <ul ref={menu} id={`${id}-options`} role="listbox" aria-labelledby={`${id}-label`} className="frosted-select-menu">
        {options.map((option, index) => <li key={option.value} id={`${id}-option-${index}`} role="option"
          aria-selected={value === option.value} data-active={activeIndex === index} className="frosted-select-option"
          onPointerMove={() => setActiveIndex(index)} onPointerDown={(event) => event.preventDefault()} onClick={() => choose(index)}>
          <span>{option.label}</span>{value === option.value && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
        </li>)}
      </ul>}
    </div>
  );
}
