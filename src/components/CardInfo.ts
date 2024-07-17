import { MouseEventHandler, ReactNode } from "react"
import { Deck, Edition } from "../Constants"

export type CardInfo = {
    id: number
    image: string
    deck: Deck
    onClick: MouseEventHandler
    children?: ReactNode

    edition?: Edition
    draggable?: boolean
    selected?: boolean
    flipped?: boolean
    debuffed?: boolean
}