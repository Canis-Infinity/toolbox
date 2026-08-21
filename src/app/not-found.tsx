export const metadata = {
  title: "找不到頁面",
  robots: {
    index: false,
    follow: false
  }
};

export default function NotFound() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">找不到頁面</CardTitle>
        <CardDescription>這個工具或分類不存在。</CardDescription>
      </CardHeader>
    </Card>
  );
}
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
