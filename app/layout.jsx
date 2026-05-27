export const metadata = {
 title:"DigitalHut Observatory"
}

export default function RootLayout({children}){

 return (
  <html>
   <body style={{
    margin:0,
    background:"#020617"
   }}>
    {children}
   </body>
  </html>
 )

}
