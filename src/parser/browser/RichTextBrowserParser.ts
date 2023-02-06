import { IDomHtmlNode, IDomNode, IDomTextNode, IParseResult, IParser } from "../parser-models";
import { convertDomNodeAttributes, isElementNode, isRootNode, isTextNode } from "../../utils/";
import { BrowserParser } from "./BrowserParser";

export class RichTextBrowserParser implements IParser<string> {
    private readonly _parser: BrowserParser;
    
    constructor() {
        this._parser = new BrowserParser();
    }

    parse(value: string): IParseResult { // TODO possible to unify into a base class, regardless of parser used?
        const document = this._parser.parse(value);

        if (isRootNode(document) && document.body.firstChild) {
            return {
                children: Array.from(document.body.childNodes).flatMap((node) => this.parseInternal(node))
            }

        }
        else {
            throw new Error();
        }
    }

    private parseInternal(document: Node): IDomNode[] {
        const parsedNodes: IDomNode[] = [];

        if (isElementNode(document)) {
            const htmlNode: IDomHtmlNode = {
                tagName: document.tagName.toLowerCase(),
                attributes: document.hasAttributes() ? convertDomNodeAttributes(document.attributes) : {},
                children: document.hasChildNodes() ? Array.from(document.childNodes).flatMap((childNode: Node) => this.parseInternal(childNode)) : [],
                type: 'tag'
            }

            parsedNodes.push(htmlNode);
        }

        else if (isTextNode(document)) {
            const textNode: IDomTextNode = {
                content: document.nodeValue ?? '',
                type: 'text'
            }

            parsedNodes.push(textNode);
        }

        return parsedNodes;
    }
}