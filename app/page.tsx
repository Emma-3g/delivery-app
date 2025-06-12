import DeliveryForm from "@/components/delivery-form"

export default function HomePage() {
  return (
    <main className="container max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Registro de Entregas</h1>
      <DeliveryForm />
    </main>
  )
}

