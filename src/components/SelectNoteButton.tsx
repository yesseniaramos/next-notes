"use client";

import useNote from "@/hooks/useNote";
import { Note } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { SidebarMenuButton } from "./ui/sidebar";
import Link from "next/link";

type Props = {
    note: Note;
}
function SelectNoteButton({ note }: Props) {
  const noteId = useSearchParams().get("noteId") || "";
  
  const { noteText: selectedNoteText } = useNote();
  const [shouldUseGlobalNoteText, setShouldUseGlobalNoteText] = useState(false);
  const [localNoteText, setLocalNoteText] = useState(note.text);

  useEffect(() => {
    if (noteId === note.id) {
      setShouldUseGlobalNoteText(true);
    } else {
      setShouldUseGlobalNoteText(false);
    }
  }, [noteId, note.id]);

  useEffect(() => {
    if(shouldUseGlobalNoteText){
      setLocalNoteText(selectedNoteText);
    }
  }, [selectedNoteText, shouldUseGlobalNoteText])

  const blankNoteText = "Empty note";

  let noteText = localNoteText || blankNoteText;

  if(shouldUseGlobalNoteText){
    noteText = selectedNoteText || blankNoteText;
  }
    return (
        <SidebarMenuButton 
            asChild 
            className={ `item-star gap-0 pr-12 ${ noteId === note.id && "bg-sidebar-accent/50"}`}
            >
            <Link href={`/?noteId=${note.id}`} className="flex h-fit flex-col items-start">
                <p className="w-full overflow-hidden text ellipsis whitespace-nowrap">
                    {noteText}
                </p>
                <p className="text-muted-foreground text-xs">
                    { note.updatedAt.toLocaleDateString() }
                </p> 
            </Link>
        </SidebarMenuButton>
    );
}

export default SelectNoteButton;