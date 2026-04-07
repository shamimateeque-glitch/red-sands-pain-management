import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Heading4, Heading5, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, Quote, Code, Minus, Palette, CheckCircle2, ChevronDown, Type } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customFontSize, setCustomFontSize] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline',
          },
        },
      }),
      BulletList.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            class: {
              default: null,
              parseHTML: element => element.getAttribute('class'),
              renderHTML: attributes => {
                if (!attributes.class) {
                  return {};
                }
                return {
                  class: attributes.class,
                };
              },
            },
          };
        },
      }),
      OrderedList,
      ListItem,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem'],
      }),
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            fontSize: {
              default: null,
              parseHTML: element => element.style.fontSize || null,
              renderHTML: attributes => {
                if (!attributes.fontSize) {
                  return {};
                }
                return {
                  style: `font-size: ${attributes.fontSize}`,
                };
              },
            },
          };
        },
      }),
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep editor content in sync when parent passes new HTML (e.g. when editing an existing treatment)
  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (!hasSelection) {
      // Show a toast or alert that text must be selected first
      alert('Please select text first to add a link');
      return;
    }

    // Get current link if text already has one
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkDialog(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;

    if (!linkUrl || linkUrl.trim() === '') {
      // Remove link if URL is empty
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      // Apply link to selected text
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }

    setShowLinkDialog(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setShowLinkDialog(false);
    setLinkUrl('');
  }, [editor]);

  const setFontSize = useCallback((size: string) => {
    if (!editor) return;
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
  }, [editor]);

  const handleCustomFontSize = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !customFontSize) return;
    
    // Add 'px' if user didn't include a unit
    const sizeValue = customFontSize.match(/\d+$/) ? `${customFontSize}px` : customFontSize;
    setFontSize(sizeValue);
    setCustomFontSize('');
  }, [editor, customFontSize, setFontSize]);

  const toggleCheckList = useCallback(() => {
    if (!editor) return;
    
    // If already a bullet list, toggle it to checkmark list
    if (editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().run();
      editor.chain().focus().toggleBulletList().run();
      editor.commands.updateAttributes('bulletList', { class: 'checkmark-list' });
    } else {
      editor.chain().focus().toggleBulletList().run();
      editor.commands.updateAttributes('bulletList', { class: 'checkmark-list' });
    }
  }, [editor]);

  const setIconList = useCallback((listType: 'benefits' | 'requirements' | 'steps' | 'warnings') => {
    if (!editor) return;
    
    const classMap = {
      benefits: 'benefits-list',
      requirements: 'requirements-list',
      steps: 'steps-list',
      warnings: 'warnings-list',
    };
    
    // If not already a bullet list, create one
    if (!editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().run();
    }
    
    // Use setAttribute to add the class
    editor.chain().focus().updateAttributes('bulletList', { 
      class: classMap[listType] 
    }).run();
  }, [editor]);

  if (!editor) return null;

  const colorOptions = [
    { label: 'Default', value: '' },
    { label: 'Maroon (Primary)', value: 'hsl(0, 38%, 42%)' },
    { label: 'Secondary', value: 'hsl(90, 13%, 35%)' },
    { label: 'Muted', value: 'hsl(90, 5%, 45%)' },
    { label: 'Green (Success)', value: '#22c55e' },
    { label: 'Blue (Info)', value: '#3b82f6' },
    { label: 'Red (Alert)', value: '#ef4444' },
    { label: 'Amber (Warning)', value: '#f59e0b' },
  ];

  const fontSizes = [
    { label: 'Small', value: '14px' },
    { label: 'Normal', value: '16px' },
    { label: 'Medium', value: '18px' },
    { label: 'Large', value: '20px' },
    { label: 'XL', value: '24px' },
    { label: '2XL', value: '28px' },
  ];

  return (
    <div className="border rounded-md">
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Headings"
              className={editor.isActive('heading') ? 'bg-muted' : ''}
            >
              <Heading2 className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background border shadow-lg z-50">
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            >
              <Heading2 className="h-4 w-4 mr-2" /> Heading 2 (Largest)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
            >
              <Heading3 className="h-4 w-4 mr-2" /> Heading 3
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              className={editor.isActive('heading', { level: 4 }) ? 'bg-muted' : ''}
            >
              <Heading4 className="h-4 w-4 mr-2" /> Heading 4
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
              className={editor.isActive('heading', { level: 5 }) ? 'bg-muted' : ''}
            >
              <Heading5 className="h-4 w-4 mr-2" /> Heading 5 (Smallest)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="w-px h-8 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-8 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Icon Lists"
            >
              <CheckCircle2 className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background border shadow-lg z-50">
            <DropdownMenuItem onClick={() => setIconList('benefits')}>
              <span className="mr-2 text-green-600">✓</span> Benefits
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIconList('requirements')}>
              <span className="mr-2 text-blue-600">ℹ</span> Requirements
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIconList('steps')}>
              <span className="mr-2 text-purple-600">→</span> Steps/Process
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIconList('warnings')}>
              <span className="mr-2 text-amber-600">⚠</span> Important Notes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="w-px h-8 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-8 bg-border mx-1" />
        
        <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openLinkDialog}
              className={editor.isActive('link') ? 'bg-muted' : ''}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Add Link</h4>
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyLink();
                    }
                  }}
                />
              </div>
              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeLink}
                  className="flex-1"
                >
                  Remove Link
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={applyLink}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Font Size"
            >
              <Type className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background border shadow-lg z-50 w-48">
            <div className="p-2">
              <form onSubmit={handleCustomFontSize} className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="e.g. 12px or 12"
                  value={customFontSize}
                  onChange={(e) => setCustomFontSize(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button type="submit" size="sm" className="h-8">Set</Button>
              </form>
            </div>
            <DropdownMenuSeparator />
            {fontSizes.map((size) => (
              <DropdownMenuItem 
                key={size.value}
                onClick={() => setFontSize(size.value)}
              >
                <span style={{ fontSize: size.value }}>{size.label} ({size.value})</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <p className="text-sm font-medium">Text Color</p>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      if (color.value) {
                        editor.chain().focus().setColor(color.value).run();
                      } else {
                        editor.chain().focus().unsetColor().run();
                      }
                      setShowColorPicker(false);
                    }}
                    className="h-10 rounded border-2 hover:border-foreground transition-colors flex items-center justify-center text-xs"
                    style={{ 
                      backgroundColor: color.value || 'transparent',
                      borderColor: color.value ? 'transparent' : 'currentColor'
                    }}
                    title={color.label}
                  >
                    {!color.value && 'Default'}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus-visible:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_h2]:text-[hsl(var(--maroon))]"
      />
    </div>
  );
};

export default RichTextEditor;
