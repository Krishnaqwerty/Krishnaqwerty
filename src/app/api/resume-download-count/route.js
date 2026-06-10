import { FieldValue } from "firebase-admin/firestore";
import { getFirestore } from "@/lib/firebaseAdmin";

const collectionName = "site_metrics";
const documentName = "resume_downloads";

export async function GET() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection(collectionName).doc(documentName).get();
    const count = snapshot.exists ? Number(snapshot.data()?.count || 0) : 0;

    return Response.json({ count });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load count." },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const db = getFirestore();
    const docRef = db.collection(collectionName).doc(documentName);

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(docRef);
      const currentCount = snapshot.exists ? Number(snapshot.data()?.count || 0) : 0;

      transaction.set(
        docRef,
        {
          count: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: snapshot.exists ? snapshot.data()?.createdAt || FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return currentCount + 1;
    });

    const updatedSnapshot = await docRef.get();
    const count = updatedSnapshot.exists ? Number(updatedSnapshot.data()?.count || 0) : 1;

    return Response.json({ count });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to increment count." },
      { status: 500 }
    );
  }
}
