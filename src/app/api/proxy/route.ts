import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy API route that calls the remote Arabic Maqam Network API
 * This avoids CORS issues by making server-to-server calls
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || '/maqamat';
    
    // Your production API base URL
    const REMOTE_API_BASE = 'https://arabic-maqam-network.vercel.app/api';
    const targetUrl = `${REMOTE_API_BASE}${endpoint}`;
    
    console.log(`Proxying request to: ${targetUrl}`);
    
    // Server-to-server call - no CORS issues!
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers here if needed
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return the data to your frontend
    return NextResponse.json({
      success: true,
      data: data,
      source: targetUrl,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Proxy API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Handle POST requests to proxy POST calls to remote API
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || '';
    const body = await request.json();
    
    const REMOTE_API_BASE = 'https://arabic-maqam-network.vercel.app/api';
    const targetUrl = `${REMOTE_API_BASE}${endpoint}`;
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      source: targetUrl,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}