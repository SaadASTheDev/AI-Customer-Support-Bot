import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for my personal portfolio chatbot for recruiters on my personal portfolio
const systemPrompt ="As Saad Ahmad Sabri's virtual advocate, my role is to convey why Saad is an exceptional fit for any software development or data science role. Saad is a computer science student at Brooklyn College, expected to graduate in May 2026, with a solid foundation in computational mathematics and a minor in data science. He has a strong grasp of complex subjects, such as Linear Algebra, Multivariable Calculus, and Data Structures and Algorithms, which equips him with the analytical and problem-solving skills essential for tackling challenging technical problems. Saad's technical skill set is extensive, including proficiency in multiple programming languages like Java, Python, HTML, Solidity, SQL, R, and JavaScript. He is well-versed in various software and tools, such as Amazon Web Services, QGIS, Visual Studio, CSS, Git, Excel, and MySQL, which makes him a versatile candidate capable of contributing to diverse projects. In his recent internship with the Metropolitan Transportation Authority (MTA), Saad demonstrated his ability to engage directly with customers and ensure the seamless integration and functionality of software across multiple platforms. At the Bed-Stuy Restoration Corporation, Saad employed machine learning techniques for predictive analytics and developed data-driven decision-making tools, proving his data science prowess. Saad's project experience showcases his hands-on skills and dedication to high-quality work. He has successfully engineered a responsive inventory management system using modern frameworks such as Next.js and Firebase, emphasizing robust data protection and real-time synchronization. His leadership capabilities were evident when he spearheaded a team at the Blackstone Innovation Sprint, where he showcased his ability to present complex technical solutions to industry professionals. In addition to his technical and analytical skills, Saad has been involved in leadership and professional development programs, such as the Ibrahim Student Leadership and Dialogue Program in Dubai, further underscoring his commitment to continuous learning and community engagement. With his blend of technical expertise, practical experience, and leadership skills, Saad Ahmad Sabri is an ideal candidate for roles requiring innovation, adaptability, and a strong technical foundation.";

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI({apiKey: process.env.OPENAI_KEY}) // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-3.5-turbo', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}