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
    bodyEs: `<h2>Alert: Draft Bill of Lading</h2>
    <p>Buenas tardes estimado cliente,</p>
    <p>Enviamos draft BL de referencia a revisión. <strong>Favor de confirmar si los datos manifestados son correctos, SHIPPER, CONSIGNEE, NOTIFY PARTY, (Nombre, dirección completa, RFC o RNC, CTC, tel, mail) descripción, peso, número de contenedor así como sellos manifestados y tipo de liberación</strong>.</p>
    <p style="color: red;"><strong>Deadline: {deadline}</strong></p>    
    <p>De requerir correcciones favor enviarlas en modo de TEXTO sobre este mismo mensaje para agilizar la respuesta a su solicitud.</p>
    <p>Saludos Cordiales.</p>
    <p>Notas importantes:</p>
    <p>**Favor de notar que por disposición oficial a partir del 16 de Febrero del año 2016 todos los BL's de importación/exportación deben manifestar el RFC/TAX Id. del Shipper, Consignee y Notify Party.</p>
    <p>**Estimado cliente, favor de confirmar con su planta el/los nos. de sello aplicados a los contenedores cargados ya que ni la línea o terminal se hacen responsables de sellos erroneos o no manifestados. Es responsabilidad del embarcador manifestar correctamente todos los sellos aplicados a los contenedores sean de la línea o del embarcador así como revisar y confirmar que los sellos manifestados en B/L sean correctos. </p>
    <p>**De igual forma se les notifica que cualquier cambio después del Vo.Bo. final y zarpe del buque aplica un cargo por corrección extemporánea</p>
    `,
    bodyEn: `<h2>Alert: Draft Bill of Lading</h2>
    <p>Good afternoon dear customer,</p>
    <p>We are sending the draft BL for your reference and review. <strong>Please confirm if the data stated is correct, SHIPPER, CONSIGNEE, NOTIFY PARTY, (Name, full address, RFC or RNC, CTC, tel, email) description, weight, container number as well as stated seals and type of release</strong>.</p>
    <p style="color: red;"><strong>Deadline: {deadline}</strong></p>    
    <p>If corrections are required, please send them as TEXT in this same message to expedite the response to your request.</p>
    <p>Best regards.</p>
    <p>Important notes:</p>
    <p>**Please note that as of February 16, 2016, all import/export BL's must include the RFC/TAX Id. of the Shipper, Consignee, and Notify Party, as per official regulations.</p>
    <p>**Dear customer, please confirm with your plant the seal numbers applied to the loaded containers, as neither the line nor the terminal are responsible for incorrect or unmanifested seals. It is the shipper's responsibility to correctly manifest all seals applied to the containers, whether they belong to the line or the shipper, and to review and confirm that the seals manifested in the B/L are correct.</p>
    <p>**Please also note that any changes after the final approval and departure of the vessel will incur a late correction fee.</p>
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

const updateEtaBody = {
    bodyEs: `<h2>Este comunicado es para informarte que el barco {vessel} ha actualizado su ETA a {new_eta_date}.</h2>
    <p>Con puerto de llegada {port} realizó cambio de ETA y por tal motivo la fecha de arribo será el día: {new_eta_date}</p>
    <p>Por favor, toma en cuenta esta información para cualquier ajuste en tus operaciones.</p>
    <p>NOTA: Para seguimiento de su carga agradecemos mantenerse en contacto con su ejecutivo.</p>
    <p>IMPORTANTE:</p>
    <p>TRANSPORTE MULTIMODAL, SA DE CV. no se hace responsable por cualquier atraso derivado de la operacion del almacen, de la terminal, terceros o actos de Dios, por lo que le recomendamos estar al pendiente de su embarque y mantener comunicacion con nosotros.</p>
    <p>Este aviso es de caracter informativo unicamente y no crea responsabilidad alguna para TRANSPORTE MULTIMODAL, SA DE CV. por problemas consecuenciales derivados de la no recepcion del mismo en tiempo y forma.</p>
    <p>TRANSPORTE MULTIMODAL, SA DE CV. no se hara responsable de demoras y almacenajes.</p>
    <p>Para cualquier duda puede ponerse en contacto con nuestros Representantes en Puerto.</p>
    <p>gracias</p>
`,
}

const notifyPort = {
    bodyEs: ` Adjuntamos el listado detallado con destino al puerto de {port}, correspondiente a la nave de referencia para los clientes de Transporte Multimodal.`
}


export { bookingConfirmationBody, draftBlBody, preAlertBody, finalAlertBody, updateEtaBody, notifyPort }
