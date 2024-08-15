"use client";

import { UploadDropzone } from "@/app/utils/UploadthingComponents";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Atom } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import TailwindEditor from "../EditorWrapper";
import { SubmitButton } from "../SubmitButtons";
import { useActionState, useState } from "react";
import { JSONContent } from "novel";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { PostSchema } from "@/app/utils/zodSchemas";
import { CreatePostAction, EditPostActions } from "@/app/actions";
import slugify from "react-slugify";

interface iAppProps {
  data: {
    slug: string;
    title: string;
    smallDescription: string;
    articleContent: any;
    id: string;
    image: string;
  };
  siteId: string;
}

export function EditArticleForm({ data, siteId }: iAppProps) {
  const [imageUrl, setImageUrl] = useState<undefined | string>(data.image);
  const [value, setValue] = useState<JSONContent | undefined>(
    data.articleContent
  );
  const [slug, setSlugValue] = useState<undefined | string>(data.slug);
  const [title, setTitle] = useState<undefined | string>(data.title);

  const [lastResult, action] = useActionState(EditPostActions, undefined);
  const [form, fields] = useForm({
    lastResult,

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PostSchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  function handleSlugGeneration() {
    const titleInput = title;

    if (titleInput?.length === 0 || titleInput === undefined) {
      return toast.error("Pleaes create a title first");
    }

    setSlugValue(slugify(titleInput));

    return toast.success("Slug has been created");
  }
  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Article Details</CardTitle>
        <CardDescription>
          Lipsum dolor sit amet, consectetur adipiscing elit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-6"
          id={form.id}
          onSubmit={form.onSubmit}
          action={action}
        >
          <input type="hidden" name="articleId" value={data.id} />
          <input type="hidden" name="siteId" value={siteId} />
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              key={fields.title.key}
              name={fields.title.name}
              defaultValue={fields.title.initialValue}
              placeholder="Nextjs blogging application"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
            <p className="text-red-500 text-sm">{fields.title.errors}</p>
          </div>

          <div className="grid gap-2">
            <Label>Slug</Label>
            <Input
              key={fields.slug.key}
              name={fields.slug.name}
              defaultValue={fields.slug.initialValue}
              placeholder="Article Slug"
              onChange={(e) => setSlugValue(e.target.value)}
              value={slug}
            />
            <Button
              onClick={handleSlugGeneration}
              className="w-fit"
              variant="secondary"
              type="button"
            >
              <Atom className="size-4 mr-2" /> Generate Slug
            </Button>
            <p className="text-red-500 text-sm">{fields.slug.errors}</p>
          </div>

          <div className="grid gap-2">
            <Label>Small Description</Label>
            <Textarea
              key={fields.smallDescription.key}
              name={fields.smallDescription.name}
              defaultValue={data.smallDescription}
              placeholder="Small Description for your blog article..."
              className="h-32"
            />
            <p className="text-red-500 text-sm">
              {fields.smallDescription.errors}
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Cover Image</Label>
            <input
              type="hidden"
              name={fields.coverImage.name}
              key={fields.coverImage.key}
              defaultValue={fields.coverImage.initialValue}
              value={imageUrl}
            />
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Uploaded Image"
                className="object-cover w-[200px] h-[200px] rounded-lg"
                width={200}
                height={200}
              />
            ) : (
              <UploadDropzone
                onClientUploadComplete={(res) => {
                  setImageUrl(res[0].url);
                  toast.success("Image has been uploaded");
                }}
                endpoint="imageUploader"
                onUploadError={() => {
                  toast.error("Something went wrong...");
                }}
              />
            )}

            <p className="text-red-500 text-sm">{fields.coverImage.errors}</p>
          </div>

          <div className="grid gap-2">
            <Label>Article Content</Label>
            <input
              type="hidden"
              name={fields.articleContent.name}
              key={fields.articleContent.key}
              defaultValue={fields.articleContent.initialValue}
              value={JSON.stringify(value)}
            />
            <TailwindEditor onChange={setValue} initialValue={value} />
            <p className="text-red-500 text-sm">
              {fields.articleContent.errors}
            </p>
          </div>

          <SubmitButton text="Edit Article" />
        </form>
      </CardContent>
    </Card>
  );
}
