import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:min-w-[400px] group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-base",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          title: "group-[.toast]:text-lg group-[.toast]:font-semibold",
          icon: "group-[.toast]:scale-125",
          loading: "group-[.toast]:animate-spin",
        },
        style: {
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          fontSize: '16px',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
