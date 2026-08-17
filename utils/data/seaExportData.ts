const bookingConfirmationBody = {
    bodyEs: `<p>
            <span style="color: rgb(13, 13, 13);"> Por medio de la presente, enviamos confirmación de Booking. Favor considerar los detalles de su reserva:</span>
        </p>
        <table class="custom-table" style="width: auto; border: 1px solid #ddd; border-collapse: collapse;">
            <tbody>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">P.O.</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{po}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Booking Linea</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{bkgline}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Booking TM</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{bkgtm}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Embarcador</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{shipper}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Equipo</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{equipo}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Peso</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{peso}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Mercancía</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{mercancia}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Bultos</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{bultos}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">B/M</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{bm}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">ETA</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{eta}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Fecha cierre de documentos</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{fechaDocs}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Fecha de cierre de despacho</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">48 horas antes del arribo del buque.</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Posicionamiento</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{posicionamiento}</td>
                </tr>
            </tbody>
        </table>
        {detail_movement_table}
        <p><strong>Conceptos</strong></p>
        <table class="custom-table" style="width: auto; border: 1px solid #ddd; border-collapse: collapse;">
            <thead>
                <tr>
                    <th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Descripción</th>
                    <th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Monto</th>
                    <th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Tipo</th>
                    <th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">PP/CC</th>
                </tr>
            </thead>
            <tbody>
                {costos}
            </tbody>
        </table>
        <p><br></p>`,

    bodyEn: `<p>
    <span style="color: rgb(13, 13, 13);">We hereby send you Booking confirmation. Please consider the details of your reservation:</span>
        </p>
        <table class="custom-table" style="width: auto; border: 1px solid #ddd; border-collapse: collapse;">
            <tbody>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">P.O.</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{po}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Booking Line</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{bkgline}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Booking TM</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{bkgtm}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Shipper</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{shipper}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Equipment</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{equipo}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Weight</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{peso}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Cargo</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{mercancia}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Packages</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{bultos}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">B/M</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{bm}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">ETA</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{eta}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Document Closing Date</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{fechaDocs}</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Dispatch Closing Date</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">48 hours before the arrival of the ship.</td>
                </tr>
                <tr>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Positioning</td>
                    <td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">{posicionamiento}</td>
                </tr>
            </tbody>
        </table>
        {detail_movement_table}
        <p><strong>Concepts</strong></p>
        <table class="custom-table" style="width: auto; border: 1px solid #ddd; border-collapse: collapse;">
            <thead>
                <tr>
                    <th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Description</th>
                    <th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Amount</th>
                    <th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Type</th>
                    <th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">PP/CC</th>
                </tr>
            </thead>
            <tbody>
                {costos}
            </tbody>
        </table>
        <p><br></p>`,
}

const draftBlBody = {
    bodyEs: `<p style="text-align: justify;">Buenas tardes estimado cliente,</p>
    <p style="text-align: justify;">Enviamos draft BL de referencia a revisión. <strong>Favor de confirmar si los datos manifestados son correctos, SHIPPER, CONSIGNEE, NOTIFY PARTY, (Nombre, dirección completa, RFC o RNC, CTC, tel, mail) descripción, peso, número de contenedor así como sellos manifestados y tipo de liberación</strong>.</p>
    <p style="color: red; text-align: justify;"><strong>Deadline: {deadline}</strong></p>
    <p style="text-align: justify;">De requerir correcciones, por favor enviarlas en modo de TEXTO sobre este mismo mensaje para agilizar la respuesta a su solicitud.</p>
    <p style="text-align: justify;">Saludos Cordiales.</p>
    <p style="text-align: justify;">Notas importantes:</p>
    <p style="text-align: justify;">**Favor de notar que por disposición oficial a partir del 16 de Febrero del año 2016 todos los BL's de importación/exportación deben manifestar el RFC/TAX Id. del Shipper, Consignee y Notify Party.</p>
    <p style="text-align: justify;">**Estimado cliente, favor de confirmar con su planta el/los nos. de sello aplicados a los contenedores cargados ya que ni la línea o terminal se hacen responsables de sellos erróneos o no manifestados. Es responsabilidad del embarcador manifestar correctamente todos los sellos aplicados a los contenedores sean de la línea o del embarcador así como revisar y confirmar que los sellos manifestados en B/L sean correctos. </p>
    <p style="text-align: justify;">**De igual forma se les notifica que cualquier cambio después del Vo.Bo. final y zarpe del buque aplica un cargo por corrección extemporánea</p>
    `,
    bodyEn: `<p style="text-align: justify;">Good afternoon dear customer,</p>
    <p style="text-align: justify;">We are sending the draft BL for your reference and review. <strong>Please confirm if the data stated is correct, SHIPPER, CONSIGNEE, NOTIFY PARTY, (Name, full address, RFC or RNC, CTC, tel, email) description, weight, container number as well as stated seals and type of release</strong>.</p>
    <p style="color: red; text-align: justify;"><strong>Deadline: {deadline}</strong></p>
    <p style="text-align: justify;">If corrections are required, please send them as TEXT in this same message to expedite the response to your request.</p>
    <p style="text-align: justify;">Best regards.</p>
    <p style="text-align: justify;">Important notes:</p>
    <p style="text-align: justify;">**Please note that as of February 16, 2016, all import/export BL's must include the RFC/TAX Id. of the Shipper, Consignee, and Notify Party, as per official regulations.</p>
    <p style="text-align: justify;">**Dear customer, please confirm with your plant the seal numbers applied to the loaded containers, as neither the line nor the terminal are responsible for incorrect or unmanifested seals. It is the shipper's responsibility to correctly manifest all seals applied to the containers, whether they belong to the line or the shipper, and to review and confirm that the seals manifested in the B/L are correct.</p>
    <p style="text-align: justify;">**Please also note that any changes after the final approval and departure of the vessel will incur a late correction fee.</p>
    `,
}

const preAlertBody = {
    bodyEs: `<h2>Alert: Pre-Alert</h2>
    <p>Estimados buenas tardes,</p>
    <p>Enviamos documentos PRELIMINARES HBL (DRAFT) ,MBL(DRAFT) SÓLO INFORMATIVO.</p>
    <p>Departure: {departure_date}. (POR CONFIRMAR)</p>
    <p>Carrier: {line_name}</p>
    <p>Shipper: {shipper}</p>
    <p>Consignee: {consignee}</p>
    <p>House BL: {housebls}</p>
    <p>Master BL: {masterbls}</p>
    <p>Thank you for choosing our services.</p>
    `,
    bodyEn: `<h2>Alert: Pre-Alert</h2>
    <p>Dear all, good afternoon,</p>
    <p>We are sending PRELIMINARY DOCUMENTS HBL (DRAFT), MBL (DRAFT) FOR INFORMATION ONLY.</p>
    <p>Departure: {departure_date}. (TO BE CONFIRMED)</p>
    <p>Carrier: {line_name}</p>
    <p>Shipper: {shipper}</p>
    <p>Consignee: {consignee}</p>
    <p>House BL: {housebls}</p>
    <p>Master BL: {masterbls}</p>
    <p>Thank you for choosing our services.</p>
    `,
}

const finalAlertBody = {
    bodyEs: `<h2>Alert: Final Bill of Lading</h2>
    <p>Estimados buenas tardes,</p>
    <p>Enviamos documentos FINALES  HBL ,MBL.</p>
    <p>Departure: {departure_date}.</p>
    <p>Carrier: {line_name}</p>
    <p>Shipper: {shipper}</p>
    <p>Consignee: {consignee}</p>
    <p>House BL: {housebls}</p>
    <p>Master BL: {masterbls}</p>
    <p>Thank you for choosing our services.</p>
    `,
    bodyEn: `<h2>Alert: Final Bill of Lading</h2>
    <p>Dear all, good afternoon,</p>
    <p>We are sending FINAL HBL / MBL.</p>
    <p>Departure: {departure_date}.</p>
    <p>Carrier: {line_name}</p>
    <p>Shipper: {shipper}</p>
    <p>Consignee: {consignee}</p>
    <p>House BL: {housebls}</p>
    <p>Master BL: {masterbls}</p>
    <p>Thank you for choosing our services.</p>
    `,
}

// Import tracks ETA (arrival to port); export tracks ETD (departure from port) at
// this same checkpoint — the wording needs to match which one is being updated.
const updateEtaBody = {
    bodyEs: (isImport: boolean) => `<h2>Le informamos que el barco {vessel} actualizó su ${isImport ? 'ETA' : 'ETD'}. La nueva fecha de ${isImport ? 'arribo al puerto de' : 'salida del puerto de'} {port} será el {new_eta_date}.</h2>
    <p>Le solicitamos considerar esta información para cualquier ajuste en sus operaciones.</p>
    <p>NOTA: Para dar seguimiento a su carga, le agradecemos mantenerse en contacto con su ejecutivo.</p>
    <p>IMPORTANTE:</p>
    <p>TRANSPORTE MULTIMODAL, SA DE CV. no se hace responsable por cualquier atraso derivado de la operación del almacén, de la terminal, terceros o actos de Dios, por lo que le recomendamos estar al pendiente de su embarque y mantener comunicación con nosotros.</p>
    <p>Este aviso es de carácter informativo únicamente y no crea responsabilidad alguna para TRANSPORTE MULTIMODAL, SA DE CV. por problemas consecuenciales derivados de la no recepción del mismo en tiempo y forma.</p>
    <p>TRANSPORTE MULTIMODAL, SA DE CV. no se hará responsable de demoras y almacenajes.</p>
    <p>Para cualquier duda, puede ponerse en contacto con nuestros representantes en puerto.</p>
    <p>Gracias.</p>
`,
}

const notifyPort = {
    bodyEs: ` Adjuntamos el listado detallado con destino al puerto de {port}, correspondiente a la nave de referencia para los clientes de Transporte Multimodal.`
}


export { bookingConfirmationBody, draftBlBody, preAlertBody, finalAlertBody, updateEtaBody, notifyPort }
