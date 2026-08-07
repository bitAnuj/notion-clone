import { ICON_LIBRARY } from "../../lib/iconLibrary";

type PageIconProps = {
  icon?: string;
  size?: number;
  className?: string;
};

function PageIcon({ icon, size = 16, className = "" }: PageIconProps) {
  if (icon && icon.startsWith("lucide:")) {
    const name = icon.replace("lucide:", "");
    const entry = ICON_LIBRARY.find((i) => i.name === name);

    if (entry) {
      const { Icon } = entry;
      return <Icon size={size} className={className} />;
    }
  }

  return <span className={className}>{icon || "📄"}</span>;
}

export default PageIcon;
