import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getHomeImages } from "@/lib/home-images";
import { getAuthenticatedUser } from "@/lib/session";
import {
  BookOpen,
  Users, 
  Trophy, 
  Calendar, 
  ChevronRight,
  LogIn,
  UserPlus,
  GraduationCap,
  FlaskConical,
  Music,
  MapPin,
  Phone,
  Mail,
  Clock,
  CircleUser
} from "lucide-react";

export const dynamic = "force-dynamic";

type UserWithProfileImage = {
  profilePicture?: string;
  avatar?: string;
};



export default async function HomePage() {
  const images = await getHomeImages();
  const user = await getAuthenticatedUser();
  const userWithProfile = user as (UserWithProfileImage & typeof user) | null;
  const userProfileImage =
    userWithProfile?.avatar || userWithProfile?.profilePicture || "";

  const notices = [
    { date: "Apr 10, 2026", title: "Final Exam Schedule Released", badge: "Important" },
    { date: "Apr 08, 2026", title: "Summer Vacation: May 15 - June 30", badge: "Holiday" },
    { date: "Apr 05, 2026", title: "Parent-Teacher Meeting on April 25", badge: "Event" },
    { date: "Apr 01, 2026", title: "Admission Open for Session 2026-27", badge: "Admission" },
  ];

  const events = [
    { day: "15", monthYear: "April 2026", title: "Annual Sports Day" },
    { day: "22", monthYear: "April 2026", title: "Science Exhibition" },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ===== HEADER AND HERO SECTION ===== */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        
        {/* ===== NAV SECTION ===== */}
        <nav className="container mx-auto flex items-center justify-end px-4 py-6">
        <div className="flex items-center gap-4">
          <Link 
            href={user ? "/profile" : "/login"} 
            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors overflow-hidden"
            title={user ? "Profile / Dashboard" : "Login"}
          >
            {user && userProfileImage ? (
              <Image 
                src={userProfileImage} 
                alt="Profile" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <CircleUser className="w-6 h-6 text-blue-600" />
            )}
          </Link>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative">
        <div className="container mx-auto px-4 pb-16 md:pb-24 pt-8 md:pt-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="text-sm font-medium border-blue-300 text-blue-700">
                Admission Open 2026-27
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                Nurturing Mind,{" "}
                <span className="text-blue-600 dark:text-blue-400">Building Futures</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Bright Future School provides world-class education with state-of-the-art facilities,
                dedicated faculty, and a holistic approach to student development.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Apply Now <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Virtual Tour
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium">
                      👤
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">5000+</span> Happy Students
                </p>
              </div>
            </div>
            <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent z-10" />
              <Image
                src={images.hero}
                alt="Students in classroom"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                preload
              />
            </div>
          </div>
        </div>
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 50C480 40 600 50 720 60C840 70 960 80 1080 75C1200 70 1320 50 1380 40L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-background dark:text-gray-950"/>
          </svg>
        </div>
      </section>
      </div>

      {/* ===== NOTICE BOARD & QUICK LINKS ===== */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Notice Board
              </CardTitle>
              <CardDescription>Latest announcements and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notices.map((notice, i) => (
                <div key={i} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-xs text-muted-foreground">{notice.date}</p>
                    <p className="font-medium">{notice.title}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{notice.badge}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardHeader>
              <CardTitle className="text-white">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-3">
                  <p className="text-2xl font-bold">{event.day}</p>
                  <p className="text-sm">{event.monthYear}</p>
                  <p className="font-medium mt-1">{event.title}</p>
                </div>
              ))}
              <Button variant="secondary" className="w-full bg-white text-blue-700 hover:bg-gray-100">
                View All Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Our Facilities & Programs</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              We provide a nurturing environment that fosters academic excellence and personal growth.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Smart Library", desc: "Over 20,000 books and digital resources" },
              { icon: FlaskConical, title: "STEM Labs", desc: "State-of-the-art science and robotics labs" },
              { icon: Trophy, title: "Sports Complex", desc: "Olympic-size pool, courts, and fields" },
              { icon: Music, title: "Arts & Music", desc: "Dedicated studios for creative expression" },
            ].map((feature, i) => (
              <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS & PRINCIPAL MESSAGE ===== */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold">120+</p>
                <p className="text-sm text-muted-foreground">Expert Teachers</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold">5000+</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm text-muted-foreground">Awards Won</p>
              </div>
            </div>
            <div className="relative h-[300px] rounded-xl overflow-hidden">
              <Image
                src={images.campus}
                alt="Campus"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          <Card className="border-none shadow-xl">
            <CardHeader>
              <Badge className="w-fit mb-2">Principal&apos;s Message</Badge>
              <CardTitle className="text-2xl">Dr. Sarah Ahmed</CardTitle>
              <CardDescription>M.Ed, Ph.D. | Principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="italic text-muted-foreground">
                &quot;At Bright Future School, we believe every child is unique and has infinite potential.
                Our mission is to provide an environment where students can discover their passions,
                develop critical thinking skills, and grow into compassionate global citizens.&quot;
              </p>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 relative overflow-hidden">
                  <Image
                    src={images.principalProfile}
                    alt="Principal"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">Dr. Sarah Ahmed</p>
                  <p className="text-xs text-muted-foreground">25+ Years Experience</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== GALLERY PREVIEW ===== */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Campus Life</h2>
              <p className="text-muted-foreground">Glimpses of our vibrant school community</p>
            </div>
            <Button variant="ghost">View Gallery →</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.gallery.map((src, i) => (
              <div key={i} className="relative h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform">
                <Image
                  src={src}
                  alt={`Gallery ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Bright Future School</h3>
              <p className="text-gray-400 text-sm">Empowering students to achieve excellence since 1995.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>About Us</li>
                <li>Admissions</li>
                <li>Academics</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact Info</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 123 Education St, City</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 234 567 890</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@brightfuture.edu</li>
                <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> Mon-Fri: 8AM - 4PM</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-3">Subscribe for updates</p>
              <div className="flex">
                <input type="email" placeholder="Your email" className="px-3 py-2 text-sm text-gray-900 rounded-l-md w-full" />
                <Button className="rounded-l-none bg-blue-600 hover:bg-blue-700">Subscribe</Button>
              </div>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <p className="text-center text-gray-500 text-sm">© 2026 Bright Future School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
