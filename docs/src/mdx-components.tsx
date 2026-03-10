import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Children, createElement, isValidElement, type ReactNode } from "react";
import { MdxCallout } from "./components/mdx-callout";
import { Mermaid } from "./components/mdx-mermaid";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingProps = {
  children?: ReactNode;
  className?: string;
  id?: string;
};

type TableProps = {
  children?: ReactNode;
  className?: string;
};

type ListItemProps = {
  children?: ReactNode;
  className?: string;
};

function joinClassName(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function isCheckboxNode(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  if (node.type !== "input") return false;

  const props = node.props as {
    type?: string;
  };

  return props.type === "checkbox";
}

function MdxListItem({ children, className, ...props }: ListItemProps) {
  const nodes = Children.toArray(children);

  const firstContentIndex = nodes.findIndex((node) => {
    if (typeof node === "string") return node.trim().length > 0;
    return true;
  });

  if (firstContentIndex < 0) {
    return createElement("li", { ...props, className }, children);
  }

  const firstNode = nodes[firstContentIndex];
  if (!isCheckboxNode(firstNode)) {
    return createElement("li", { ...props, className }, children);
  }

  const restNodes = nodes.slice(firstContentIndex + 1);
  while (restNodes.length > 0) {
    const head = restNodes[0];
    if (typeof head === "string" && head.trim().length === 0) {
      restNodes.shift();
      continue;
    }
    break;
  }

  return createElement(
    "li",
    {
      ...props,
      className: joinClassName(className, "task-list-item-row"),
    },
    createElement(
      "span",
      { className: "task-list-checkbox-wrap", "aria-hidden": true },
      firstNode,
    ),
    createElement("div", { className: "task-list-content" }, restNodes),
  );
}

function MdxTable({ children, className, ...props }: TableProps) {
  return createElement(
    "div",
    {
      className:
        "relative overflow-auto overflow-x-auto prose-no-margin my-6 mdx-table-scroll",
      tabIndex: 0,
      role: "region",
      "aria-label": "Interactive table",
    },
    createElement("table", { ...props, className }, children),
  );
}

function createHeading(level: HeadingLevel) {
  return function Heading({ children, id, ...props }: HeadingProps) {
    const items = Children.toArray(children);

    const anchorIndex = items.findIndex((item) => {
      if (!isValidElement(item)) return false;
      if (item.type !== "a") return false;

      const anchorProps = item.props as {
        href?: string;
        [key: string]: unknown;
      };

      return (
        typeof anchorProps.href === "string" &&
        anchorProps.href.startsWith("#") &&
        "data-card" in anchorProps
      );
    });

    const titleNode = (() => {
      if (anchorIndex < 0) return children;

      const anchorNode = items[anchorIndex];
      if (!isValidElement(anchorNode) || anchorNode.type !== "a") {
        return children;
      }

      const anchorProps = anchorNode.props as {
        children?: ReactNode;
      };

      return anchorProps.children ?? children;
    })();

    return createElement(
      level,
      { ...props, id },
      createElement(
        "div",
        { className: "heading-wrap" },
        createElement("span", { className: "heading-title-text" }, titleNode),
        id
          ? createElement(
              "a",
              {
                href: `#${id}`,
                className: "heading-hash-link no-styling",
                "aria-label": "跳转到当前标题",
              },
              "#",
            )
          : null,
      ),
    );
  };
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    h1: createHeading("h1"),
    h2: createHeading("h2"),
    h3: createHeading("h3"),
    h4: createHeading("h4"),
    h5: createHeading("h5"),
    h6: createHeading("h6"),
    li: MdxListItem,
    table: MdxTable,
    Callout: MdxCallout,
    Mermaid,
  };
}
