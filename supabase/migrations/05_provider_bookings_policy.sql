-- Allow providers to view bookings for their own services
CREATE POLICY "Providers can view bookings for their services"
ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.services
    WHERE services.id = bookings.service_id
    AND services.provider_id = auth.uid()::text
  )
);
